module.exports = function buildPrompt(data){
    return `
    Generate a personalized travel plan:
    -Location: ${data.location}
    -Dates ${data.arrivalDate} to ${data.departtureDate}
    -Number of travelers: ${data.numberOfTravelers}
    -Kids:${data.kids? 'yes': 'no'}
    -Interests:${data.interests.join(',')}
    -Budget: ${data.budget}
    -Additional notes: ${data.additionalNotes || 'none'}

    Use this JSON format:
{
    "Location": "...",
    "ArrivalDay": "...",
    "DepartureDay": "...",
    "Duration": "...",
    "NumberOfTravelers": "...",
    "Activities": [
    { 

        "Day": 1,
        "Date": "...",
        "Activities": [
        {"Time": "Morning","Description":"", "Cost":"", "Notes":""}
        ]
      }
  ]
 }
`;
};