# MindBridge — Sample Seed Data

## What's Included

| Collection           | Records | Purpose                                      |
|----------------------|---------|----------------------------------------------|
| `users`              | 8       | Sample patients across India, multilingual   |
| `screeningsessions`  | ~200+   | PHQ-9 & GAD-7 sessions with trend data       |
| `gamesessions`       | ~60     | AI situational game results                  |
| `chatsessions`       | ~30     | MindBot conversation histories               |
| `voicenotes`         | ~37     | Voice recording analysis results             |
| `monthlyanalytics`   | 6       | Monthly platform stats for admin dashboard   |
| `resources`          | 6       | WHO-based mental health resource links       |

## Quick Start

```bash
cd mindbridge-seed
npm install
npm run seed:local          # local MongoDB
# OR
MONGO_URI=your_atlas_uri node seedData.js   # MongoDB Atlas
```

## Test Login Credentials
All accounts use password: `Test@1234`

| Email                | Name         | Language | State       |
|----------------------|--------------|----------|-------------|
| lovi@example.com     | Lovi Sharma  | English  | Rajasthan   |
| priya@example.com    | Priya Verma  | Hindi    | Maharashtra |
| arjun@example.com    | Arjun Mehta  | English  | Karnataka   |
| meera@example.com    | Meera Nair   | Tamil    | Tamil Nadu  |
| rahul@example.com    | Rahul Gupta  | English  | Delhi       |
| anjali@example.com   | Anjali Singh | Hindi    | UP          |
| dev@example.com      | Dev Patel    | English  | Gujarat     |
| sara@example.com     | Sara Khan    | Arabic   | West Bengal |

## Chart Data Highlights

### Lovi's PHQ-9 Recovery Arc (18 sessions over 90 days)
`22 → 20 → 18 → 16 → 13 → 11 → 9 → 8 → 7 → 6 → 7 → 5 → 6 → 5 → 4 → 5 → 4 → 3`
> Severe → Moderately Severe → Moderate → Mild → Minimal

### Lovi's GAD-7 Recovery Arc
`18 → 17 → 15 → 14 → 12 → 11 → 10 → 9 → 8 → 8 → 7 → 6 → 6 → 5 → 5 → 4 → 4 → 3`
> Severe → Moderate → Mild → Minimal

## Graph Recommendations

| Graph Type   | Data Source              | X-axis         | Y-axis         |
|--------------|--------------------------|----------------|----------------|
| Line Chart   | screeningsessions (PHQ9) | completedAt    | totalScore     |
| Line Chart   | screeningsessions (GAD7) | completedAt    | totalScore     |
| Bar Chart    | monthlyanalytics         | month          | screeningsCompleted |
| Radar Chart  | gamesessions             | emotionalDimensions | score     |
| Doughnut     | screeningsessions        | severity       | count          |
| Area Chart   | monthlyanalytics         | month          | newRegistrations |

## API Query Examples

```js
// Get Lovi's PHQ-9 trend for line chart
db.screeningsessions.find(
  { userId: ObjectId("...lovi_id..."), type: "PHQ9" },
  { totalScore: 1, completedAt: 1, severity: 1 }
).sort({ completedAt: 1 })

// Severity distribution for doughnut chart
db.screeningsessions.aggregate([
  { $group: { _id: "$severity", count: { $sum: 1 } } }
])

// Monthly screenings for bar chart
db.monthlyanalytics.find({}).sort({ generatedAt: 1 })
```
