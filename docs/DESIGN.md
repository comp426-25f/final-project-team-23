# Design Document

> Written by: <YOUR NAMES> for COMP 426: Modern Web Programming at UNC-Chapel Hill.

## Feature Plan

*Replace this with your feature plan. Write a bit more detail under each heading from before (description, user, purpose). Also, add a fourth section to each with some technical notes on how you may implement each feature and any other backend or frontend notes you may need.*

### Feature 1: AI Trip Planner

**Description:** Users can utilize AI to generate a day-by-day, hourly itinerary. They may input any prompt about a destination they want to go to, how many days they are planning on staying, and information about what they would be interested in doing or what kind of traveler they are. The AI feature will output daily itinerary ideas in response according to what is popular and available for tourists, as well as ideas for places to eat if the user requests it. It should return in the format of day sections with bullet points of time slots and corresponding activities, with information on each activity.

**User(s):** This feature is important for users who don't like to do their own research and would like quick ideas on what to do day by day. It is also important for users who want to simplify their trip planning process, as all information and hourly itineraries can be generated for them on the spot. It allows ease of use and a better experience for users.

**Purpose:** This feature is significant for target users because it allows for easier trip planning when faced with an excess of information on things to do, what to see, etc, on the internet. This simplifies the whole process and makes gathering ideas on what to do much simpler for people already stressed out about travel plans. It also provides an easy method for lazy users or users who don't have the time or resources to spend hours scouring the internet or doing research to plan everything themselves.

**Technical Notes:** This feature will be implemented using our provided OpenAI key, which will be able to supply itinerary output as we direct it to. In the frontend, we have to create an AI-like messaging page that allows the user to type and send a message before getting a response from the model. Since we also want the user to be able to save itineraries generated from our AI, we have an itinerary table that can be joined with associated itinerary days and activities. This way, it can be saved to our DB as long as we can get the chat output to match our data model.

### Feature 2: ___

**Description:**

**User(s):**

**Purpose:**

**Technical Notes:**

### Feature 3: ___

**Description:**

**User(s):**

**Purpose:**

**Technical Notes:**

### Feature 4: ___

**Description:**

**User(s):**

**Purpose:**

**Technical Notes:**

### Feature 5: ___

**Description:**

**User(s):**

**Purpose:**

**Technical Notes:**

*Feel free to add more here if needed.*

## Backend Database Schema

<img width="1304" height="705" alt="Screenshot 2025-11-11 at 10 33 55 PM" src="https://github.com/user-attachments/assets/4db6599d-84ad-4674-82b7-c1c40e88841f" />

DB Schema to support AI Trip Planning, Collaborative Itinerary Editing, Following Feed + Explore Travel Feed, Posting Travel Journals + Photo Galleries, and Travel Buddy Chats.
*Please add a short description for important design considerations.

## High-Fidelity Prototype

*Replace this with an embedded Figma project here.*
