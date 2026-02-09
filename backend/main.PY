import os
import io
import json
import pandas as pd
from typing import List
from fastapi import FastAPI, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from crewai import Agent, Task, Crew, LLM
from crewai_tools import SerperDevTool

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite's default port
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 1. Define the Data Structure ---
class Lead(BaseModel):
    name: str = Field(description="The name of the clinic or hospital")
    website: str = Field(description="The official website URL")
    specialty: str = Field(description="Short note on what they do (e.g., neuro-rehab, sports physio)")
    contact_number: str = Field(description="Phone number if available, otherwise 'N/A'")

class LeadList(BaseModel):
    leads: List[Lead]

# --- 2. Initialize LLM & Tools ---
openrouter_llm = LLM(
    model="openrouter/arcee-ai/trinity-large-preview:free",
    api_key=os.getenv("OPENROUTER_API_KEY"),
    temperature=0.2
)
search_tool = SerperDevTool()

# --- 3. The Prospecting Logic ---
# ... (Keep imports and models as they are)

def get_leads_from_crew(city: str):
    scout = Agent(
        role='Healthcare Market Researcher',
        goal=f'Find 20 unique physiotherapy or rehabilitation centers in {city} with their contact details.',
        backstory='You are a detail-oriented researcher. You always provide full URLs, correct names, and phone numbers.',
        tools=[search_tool],
        llm=openrouter_llm,
        verbose=True,
        allow_delegation=False # Keeps the agent focused
    )

    task = Task(
        description=(
            f"Search for 20 physiotherapy clinics in {city}. "
            "For each clinic, find the Name, Website, Contact Number (phone), and a short specialty note. "
            "If contact number is not available, use 'N/A'. "
            "Return the data strictly as a JSON list following the schema provided. "
            "Do not include any conversational text or markdown code blocks."
        ),
        expected_output='A structured list of 20 validated leads with names, websites, contact numbers, and specialties in Pydantic format.',
        output_pydantic=LeadList, # <--- Changed from output_json for better validation
        agent=scout
    )

    crew = Crew(agents=[scout], tasks=[task])
    try:
        result = crew.kickoff()
    except Exception as e:
        # Common cause: telemetry exporter timing out trying to reach external OTLP endpoint
        print(f"Crew kickoff failed: {e}")
        print("If your network blocks telemetry or the default telemetry host is unreachable,")
        print("set the environment variable DISABLE_CREWAI_TELEMETRY=1 or check your network.")
        return []

    # --- DEBUGGING LOGIC ---
    print("RAW RESULT:", result.raw) # This will show in your terminal
    
    # Access the pydantic object
    if hasattr(result, 'pydantic') and result.pydantic:
        return result.pydantic.leads
    
    # Fallback: Try to manual-parse if pydantic is empty
    import json
    import re
    try:
        # Extract JSON from potential markdown blocks
        raw_str = result.raw
        json_match = re.search(r'\[.*\]|\{.*\}', raw_str, re.DOTALL)
        if json_match:
            data = json.loads(json_match.group())
            # If the LLM returned a list directly instead of the wrapper object
            if isinstance(data, list):
                return [Lead(**item) for item in data]
            return [Lead(**item) for item in data.get('leads', [])]
    except Exception as e:
        print(f"Manual Parse Error: {e}")
        
    return []

# Update your /prospect endpoint to handle the list of objects
@app.get("/prospect")
async def prospect_clinics(city: str = "Kochi"):
    leads = get_leads_from_crew(city)
    # Convert Pydantic objects to dicts for JSON response
    return {"city": city, "leads": [l.model_dump() for l in leads]}
@app.get("/download-excel")
async def download_excel(city: str = "Kochi"):
    leads = get_leads_from_crew(city)
    
    # Convert list of Pydantic models to a list of dicts
    data = [lead.model_dump() for lead in leads]
    df = pd.DataFrame(data)

    # Create an in-memory Excel file
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Leads')
    
    output.seek(0)
    
    headers = {
        'Content-Disposition': f'attachment; filename="Remap_Leads_{city}.xlsx"'
    }
    return StreamingResponse(output, headers=headers, media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)