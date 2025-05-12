module.exports = function buildPrompt({
  destination,
  startDate,
  endDate,
  numberOfAdults,
  numberOfKids,
  interests,
  budget,
  customPreferences,
}) {
  let userInfo = {
    destination,
    startDate,
    endDate,
    numberOfAdults,
    numberOfKids,
    interests,
    budget,
    customPreferences,
  };
  return `
   Generate a personalized travel plan based on user inputs provided below:
   User Info: ${JSON.stringify(userInfo)}
   }
   Travel Plan should be structured as follows:
Travel Plan Object:
{
   "Destination": destination,
   "Duration": endDate - startDate,
   "TotalNumberOfTravelers": numberOfAdults + numberOfKids,
   "Interests": interests,
   "Budget": budget
   "Custom Preferences": customPreferences
   "Activities": [
   {
     "Day": 1,
     "Date": "...",
     "Activities": [
       {
         "Time": "Morning",
         "Description": "...",
         "Cost": "...",
         "Notes": "..."
       }
       // ... more activities for day 1
     ]
   },
   // ... more days based on the duration
 ]
}
Generate the travel plan based on the user input and using the structure above (JSON format only)
and fill in the necessary details for the remaining days based on the duration of the travel.
Plan activities for morning, afternoon and evenings.
`;
};
