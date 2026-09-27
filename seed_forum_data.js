const dns = require("node:dns");
try {
  dns.setServers(["1.1.1.1", "8.8.8.8"]);
} catch (e) {}
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

const uri = process.env.DATABASE_URL || process.env.MONGODB_URI;

const enrichedPosts = [
  // 1. Update/Keep Post 1: Metabolic Burn Circuit
  {
    _id: new ObjectId("6a414f2c9dfe3eee48bf619c"),
    title: "High-Density Metabolic Circuit: Maximize EPOC & Fat Oxidation",
    description: "Metabolic resistance training (MRT) combines multi-joint barbell and kettlebell exercises performed with minimal rest intervals to induce excess post-exercise oxygen consumption (EPOC). This 4-station protocol targets total-body lactate accumulation while preserving lean muscle tissue.\n\nStation 1: Kettlebell Swings (24kg x 20 reps)\nStation 2: Barbell Thrusters (45kg x 12 reps)\nStation 3: Renegade Rows to Push-Up (10 reps per side)\nStation 4: Assault Bike Sprint (45 sec max effort)\n\nRest 90 seconds between rounds. Repeat for 4 total circuits. Monitor heart rate to ensure recovery stays within Zone 4 (80-90% HRmax) during working intervals.",
    image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80",
    userName: "Alana Serrano",
    userImage: "https://t4.ftcdn.net/jpg/11/66/06/77/360_F_1166067709_2SooAuPWXp20XkGev7oOT7nuK1VThCsN.jpg",
    userRole: "trainer",
    userId: "6a4135589c11ec5aabb4de0b",
    createdAt: new Date("2026-09-24T10:15:00.000Z"),
    status: "approved",
    likes: ["6a3fd6919224486c4e78ad8e", "6a3fddbc9224486c4e78ad92", "6a425783eaaa0a48bb426fcc"],
    dislikes: [],
    comments: [
      {
        _id: new ObjectId(),
        userId: "6a425783eaaa0a48bb426fcc",
        userName: "Wasif Hasan",
        userImage: "https://lh3.googleusercontent.com/a/ACg8ocKzbEXd0N7V406ocsmdiEQkxCVV1BIJpiTn--O3W0TqjLiNy6e3=s96-c",
        userRole: "member",
        content: "Ran this circuit yesterday after heavy squats. The assault bike finisher is brutal! Would you recommend lowering thruster weight on rounds 3 and 4 to maintain bar speed?",
        likes: ["6a4135589c11ec5aabb4de0b"],
        replies: [
          {
            _id: new ObjectId(),
            userId: "6a4135589c11ec5aabb4de0b",
            userName: "Alana Serrano",
            userImage: "https://t4.ftcdn.net/jpg/11/66/06/77/360_F_1166067709_2SooAuPWXp20XkGev7oOT7nuK1VThCsN.jpg",
            userRole: "trainer",
            content: "Yes Wasif! If your bar speed drops significantly, drop the thruster load to 35kg. The primary training stimulus here is metabolic turnover and uninterrupted tempo, not maximal strain.",
            createdAt: new Date("2026-09-24T12:30:00.000Z")
          }
        ],
        createdAt: new Date("2026-09-24T11:45:00.000Z")
      }
    ]
  },

  // 2. Flexibility & Balance Studio
  {
    _id: new ObjectId("6a4149469dfe3eee48bf619b"),
    title: "Deep Hip & Thoracic Mobility: Desk Worker Decompression Protocol",
    description: "Prolonged sitting keeps the psoas in a chronically shortened state while inhibiting the gluteus maximus and collapsing thoracic extension. This 15-minute daily restorative routine unlocks the anterior chain and restores functional pelvic alignment.\n\n1. 90/90 Hip Internal & External Rotations with PAILs/RAILs (3 mins per side)\n2. Couch Stretch with Posterior Pelvic Tilt (2 mins per side)\n3. Thoracic Extensions over a Foam Roller with Ribcage Flaring Check (15 reps)\n4. Active Deep Squat Hold with Ankle Dorsiflexion Mobilization (3 mins cumulative)\n\nIncorporate this daily before training or before bed to prevent lower back compensation during heavy pulling movements.",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80",
    userName: "Alana Serrano",
    userImage: "https://t4.ftcdn.net/jpg/11/66/06/77/360_F_1166067709_2SooAuPWXp20XkGev7oOT7nuK1VThCsN.jpg",
    userRole: "trainer",
    userId: "6a4135589c11ec5aabb4de0b",
    createdAt: new Date("2026-09-23T14:20:00.000Z"),
    status: "approved",
    likes: ["6a3fd2bbfcfac5bfb35a347c", "6a3fd6919224486c4e78ad8e", "6a3fe0499224486c4e78ad96"],
    dislikes: [],
    comments: [
      {
        _id: new ObjectId(),
        userId: "6a3fddbc9224486c4e78ad92",
        userName: "Noah Guzman",
        userImage: "https://prio.co.in/avatar.png",
        userRole: "member",
        content: "The 90/90 drill fixed my hip pinch at the bottom of back squats! Highly recommended for anyone struggling with deep hip flexion.",
        likes: ["6a4135589c11ec5aabb4de0b", "6a425783eaaa0a48bb426fcc"],
        replies: [],
        createdAt: new Date("2026-09-23T16:00:00.000Z")
      }
    ]
  },

  // 3. Dynamic Core Fusion
  {
    _id: new ObjectId("6a4148f89dfe3eee48bf6199"),
    title: "Anti-Rotation Core Stability: Building Unshakeable Spinal Rigidity",
    description: "Crunches and sit-ups only train sagittal flexion. Real athletic power requires anti-rotation and anti-lateral flexion endurance to transfer force from the lower extremities to the upper extremities without energy leaks.\n\nEssential Drills:\n- Pallof Press with 3-Second Isometric Holds (3 sets of 12 reps/side)\n- Suitcase Carries with Heavy Dumbbell (4 sets of 40 meters each hand)\n- Ab Wheel Rollouts from Toes with Pelvic Tuck (3 sets of 8-10 reps)\n- Half-Kneeling Cable Chops & Lifts (3 sets of 12 reps)\n\nMaintain neutral lumbar curvature throughout. Focus on intra-abdominal pressure (IAP) through deep diaphragmatic breathing.",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80",
    userName: "Alana Serrano",
    userImage: "https://t4.ftcdn.net/jpg/11/66/06/77/360_F_1166067709_2SooAuPWXp20XkGev7oOT7nuK1VThCsN.jpg",
    userRole: "trainer",
    userId: "6a4135589c11ec5aabb4de0b",
    createdAt: new Date("2026-09-22T09:30:00.000Z"),
    status: "approved",
    likes: ["6a3fd6919224486c4e78ad8e", "6a425783eaaa0a48bb426fcc"],
    dislikes: [],
    comments: []
  },

  // 4. Power & Endurance Challenge
  {
    _id: new ObjectId("6a4148749dfe3eee48bf6198"),
    title: "Power & Plyometric Stamina: Developing Vertical Explosiveness",
    description: "Athletic power is defined as force multiplied by velocity (P = F x v). To recruit high-threshold Type IIx motor units, plyometrics must be trained in a non-fatigued neuromuscular state before endurance blocks.\n\nPhase 1 (Neural Activation):\n- Depth Jumps from 18-inch box (4 sets of 5 reps, focus on minimal ground contact time < 0.2s)\n- Trap Bar Jumps at 20% 1RM (4 sets of 4 reps)\n\nPhase 2 (Metabolic Stamina):\n- Medicine Ball Rotational Slams (30 sec work / 30 sec rest x 6 rounds)\n- Sled Push 50m Heavy Sprint (5 rounds with 90s walk recovery)\n\nTrack your jump flight time with laser mats or video feedback to ensure velocity does not drop more than 10%.",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80",
    userName: "Alana Serrano",
    userImage: "https://t4.ftcdn.net/jpg/11/66/06/77/360_F_1166067709_2SooAuPWXp20XkGev7oOT7nuK1VThCsN.jpg",
    userRole: "trainer",
    userId: "6a4135589c11ec5aabb4de0b",
    createdAt: new Date("2026-09-21T11:00:00.000Z"),
    status: "approved",
    likes: ["6a3fd2bbfcfac5bfb35a347c", "6a425783eaaa0a48bb426fcc", "6a3ff2a89224486c4e78ad99"],
    dislikes: [],
    comments: []
  },

  // 5. Elite Functional Training
  {
    _id: new ObjectId("6a41483e9dfe3eee48bf6197"),
    title: "Functional Kettlebell Complex: The Armor Building Protocol",
    description: "Coined by master strength coach Dan John, the Armor Building Complex is one of the most time-efficient protocols for developing dense, resilient athletic musculature and grip endurance.\n\nThe Complex (Double Kettlebells 2x24kg):\n- 2 Double Clean\n- 1 Double Strict Overhead Press\n- 3 Double Front Squats\n\nRule: Do not set the bells down until all 6 reps are completed. Rest 60-90 seconds. Strive to complete 15-20 total complexes in 30 minutes. Focus on aggressive abdominal bracing at the bottom of every front squat.",
    image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=1200&q=80",
    userName: "Trainer",
    userImage: "https://prio.co.in/avatar.png",
    userRole: "trainer",
    userId: "6a3fd6919224486c4e78ad8e",
    createdAt: new Date("2026-09-20T16:00:00.000Z"),
    status: "approved",
    likes: ["6a4135589c11ec5aabb4de0b", "6a425783eaaa0a48bb426fcc", "6a3fd2bbfcfac5bfb35a347c"],
    dislikes: [],
    comments: [
      {
        _id: new ObjectId(),
        userId: "6a425783eaaa0a48bb426fcc",
        userName: "Wasif Hasan",
        userImage: "https://lh3.googleusercontent.com/a/ACg8ocKzbEXd0N7V406ocsmdiEQkxCVV1BIJpiTn--O3W0TqjLiNy6e3=s96-c",
        userRole: "member",
        content: "Tested this with 2x20kg bells. The upper back and forearms got an incredible pump. Great protocol for busy days!",
        likes: ["6a3fd6919224486c4e78ad8e"],
        replies: [],
        createdAt: new Date("2026-09-20T18:15:00.000Z")
      }
    ]
  },

  // 6. Total Body Transformation
  {
    _id: new ObjectId("6a41481d9dfe3eee48bf6196"),
    title: "The 12-Week Recomposition Blueprint: Sustaining Lean Muscle in a Caloric Deficit",
    description: "Body recomposition—gaining muscle while losing adipose tissue—is entirely feasible for intermediate trainees when caloric deficits are capped at 15-20% and protein intake remains elevated at 2.2g per kg of body mass.\n\nKey Tenets:\n1. Maintain Heavy Mechanical Tension: Never switch to lightweight high reps when cutting. Keep lifting in the 6-10 rep range to signal muscle retention to the nervous system.\n2. Nutrient Partitioning: Consume 50% of your daily carbohydrates around your peri-workout window (pre and post-training).\n3. Non-Exercise Activity Thermogenesis (NEAT): Aim for a consistent 10,000 steps daily rather than excessive high-impact cardio that drains systemic recovery.",
    image: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=1200&q=80",
    userName: "Alana Serrano",
    userImage: "https://t4.ftcdn.net/jpg/11/66/06/77/360_F_1166067709_2SooAuPWXp20XkGev7oOT7nuK1VThCsN.jpg",
    userRole: "trainer",
    userId: "6a4135589c11ec5aabb4de0b",
    createdAt: new Date("2026-09-19T08:45:00.000Z"),
    status: "approved",
    likes: ["6a3fd6919224486c4e78ad8e", "6a3fddbc9224486c4e78ad92"],
    dislikes: [],
    comments: []
  },

  // 7. Athletic Performance Lab
  {
    _id: new ObjectId("6a4144059dfe3eee48bf6195"),
    title: "Sprint Mechanics & Ground Reaction Force: The Speed Science Lab",
    description: "Maximal sprint velocity is determined by the amount of ground reaction force (GRF) an athlete can apply during the brief stance phase (~0.08 to 0.10 seconds).\n\nKey Technical Checkpoints:\n- Front-Side Mechanics: High knee drive with active ankle dorsiflexion (toe pointed up, 'strike from above').\n- Posture: 5-degree forward lean from the ground up, not bending at the waist.\n- Cue: 'Punch down and claw back' rather than over-striding in front of the center of mass.\n\nCombine unresisted 30m flying sprints with 10% velocity decrement sled sprints for optimal acceleration mechanics.",
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80",
    userName: "Mollie Porter",
    userImage: "https://prio.co.in/avatar.png",
    userRole: "admin",
    userId: "6a3fd2bbfcfac5bfb35a347c",
    createdAt: new Date("2026-09-18T15:10:00.000Z"),
    status: "approved",
    likes: ["6a4135589c11ec5aabb4de0b", "6a3fd6919224486c4e78ad8e", "6a425783eaaa0a48bb426fcc", "6a3fddbc9224486c4e78ad92"],
    dislikes: [],
    comments: [
      {
        _id: new ObjectId(),
        userId: "6a3fddbc9224486c4e78ad92",
        userName: "Noah Guzman",
        userImage: "https://prio.co.in/avatar.png",
        userRole: "member",
        content: "As someone training for an 800m track trial, the ankle dorsiflexion cue gave me instant improvements in ground contact stiffness!",
        likes: ["6a3fd2bbfcfac5bfb35a347c"],
        replies: [],
        createdAt: new Date("2026-09-18T17:30:00.000Z")
      }
    ]
  },

  // 8. Rename previous duplicate Metabolic post to Hypertrophy
  {
    _id: new ObjectId("6a41491a9dfe3eee48bf619a"),
    title: "Progressive Overload & RPE: When to Add Weight vs Reps",
    description: "Progressive overload is the fundamental driver of muscular hypertrophy and neural adaptation. However, adding 2.5kg to the bar every single week is impossible past the beginner stage. You must utilize double progression.\n\nHow Double Progression Works:\n1. Choose a target rep range (e.g., 8-12 reps).\n2. Keep load constant until you achieve the top of the range (12 reps) with 1-2 reps in reserve (RIR 1-2 / RPE 8-9) across ALL working sets.\n3. Increase the load by 2.5-5% and begin again at the bottom of the rep range (8 reps).\n\nThis prevents premature technical breakdown and joint inflammation while ensuring steady muscle fiber recruitment.",
    image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1200&q=80",
    userName: "Trainer",
    userImage: "https://prio.co.in/avatar.png",
    userRole: "trainer",
    userId: "6a3fd6919224486c4e78ad8e",
    createdAt: new Date("2026-09-17T12:00:00.000Z"),
    status: "approved",
    likes: ["6a4135589c11ec5aabb4de0b", "6a425783eaaa0a48bb426fcc"],
    dislikes: [],
    comments: []
  },

  // 9. NEW POST: Zone 2 Cardio
  {
    _id: new ObjectId("6a42a1019dfe3eee48bf7001"),
    title: "Zone 2 Cardio Protocols: Building Mitochondrial Density for Lifters",
    description: "Many strength athletes fear that cardiovascular training causes muscle catabolism via AMPK/mTOR interference. However, low-intensity Zone 2 cardio (60-70% max heart rate) enhances capillary density and mitochondrial biogenesis, which actually expedites between-set ATP regeneration on heavy squats and deadlifts.\n\nRecommended Dosing:\n- 120-150 minutes weekly, split across 3 sessions of 40-50 minutes.\n- Modalities: Incline treadmill walking (12% incline, 4.5-5.0 km/h), stationary bike, or Concept2 rowing at conversational pace.\n- Marker: You should be able to breathe exclusively through your nose or speak in complete sentences without gasping.",
    image: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=1200&q=80",
    userName: "Noah Guzman",
    userImage: "https://prio.co.in/avatar.png",
    userRole: "member",
    userId: "6a3fddbc9224486c4e78ad92",
    createdAt: new Date("2026-09-26T16:00:00.000Z"),
    status: "approved",
    likes: ["6a4135589c11ec5aabb4de0b", "6a3fd6919224486c4e78ad8e", "6a425783eaaa0a48bb426fcc"],
    dislikes: [],
    comments: [
      {
        _id: new ObjectId(),
        userId: "6a4135589c11ec5aabb4de0b",
        userName: "Alana Serrano",
        userImage: "https://t4.ftcdn.net/jpg/11/66/06/77/360_F_1166067709_2SooAuPWXp20XkGev7oOT7nuK1VThCsN.jpg",
        userRole: "trainer",
        content: "Spot on Noah! We have all our competitive powerlifters do 45 mins of Zone 2 on Sundays. Their recovery between 5x5 squats improved drastically within 4 weeks.",
        likes: ["6a3fddbc9224486c4e78ad92", "6a425783eaaa0a48bb426fcc"],
        replies: [],
        createdAt: new Date("2026-09-26T18:00:00.000Z")
      }
    ]
  },

  // 10. NEW POST: Macro Timing & Carb Backloading
  {
    _id: new ObjectId("6a42a1019dfe3eee48bf7002"),
    title: "Carb Cycling & Macro Timing: Optimizing Insulin Sensitivity for Hypertrophy",
    description: "Carbohydrates are an athlete's primary fuel source for anaerobic glycolysis, but chronic high insulin levels can impair fat oxidation and metabolic flexibility. Strategic carbohydrate timing allows you to replenish muscle glycogen without unwanted visceral adipose gain.\n\nStructure:\n- High Carb Days (Legs & Back): 4-5g per kg bodyweight. Prioritize complex starches (sweet potatoes, jasmine rice, oats) with 60% consumed post-workout.\n- Low Carb Days (Rest / Active Recovery): 1.5-2.0g per kg bodyweight. Increase healthy monounsaturated fats (avocados, extra virgin olive oil, almonds) to sustain endocrine hormonal production.\n- Daily Protein Anchor: Keep steady at 2.2g/kg divided equally across 4 meals (40g per feeding for peak MPS via leucine threshold).",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=80",
    userName: "Wasif Hasan",
    userImage: "https://lh3.googleusercontent.com/a/ACg8ocKzbEXd0N7V406ocsmdiEQkxCVV1BIJpiTn--O3W0TqjLiNy6e3=s96-c",
    userRole: "member",
    userId: "6a425783eaaa0a48bb426fcc",
    createdAt: new Date("2026-09-25T13:45:00.000Z"),
    status: "approved",
    likes: ["6a3fd2bbfcfac5bfb35a347c", "6a3fd6919224486c4e78ad8e", "6a4135589c11ec5aabb4de0b"],
    dislikes: [],
    comments: [
      {
        _id: new ObjectId(),
        userId: "6a3fd6919224486c4e78ad8e",
        userName: "Trainer",
        userImage: "https://prio.co.in/avatar.png",
        userRole: "trainer",
        content: "Great breakdown of the leucine threshold Wasif. Most people don't realize eating 15g protein 6 times a day doesn't stimulate mTOR as effectively as 4 bolus doses of 40g.",
        likes: ["6a425783eaaa0a48bb426fcc"],
        replies: [],
        createdAt: new Date("2026-09-25T15:20:00.000Z")
      }
    ]
  },

  // 11. NEW POST: Squat & Knee Biomechanics
  {
    _id: new ObjectId("6a42a1019dfe3eee48bf7003"),
    title: "Squat Depth & Knee Tracking: Debunking the 'Knees Over Toes' Myth",
    description: "For decades, trainees were told that allowing knees to travel past toes during squats damages the patellofemoral joint. Modern biomechanical research has proven this false—restricting anterior tibial translation actually forces excessive forward trunk lean, multiplying shear stresses on the lumbar spine by over 1000%.\n\nHealthy Squat Checklist:\n1. Ankle Dorsiflexion: If your heels lift, elevate them on 0.5-inch wedges or Olympic weightlifting shoes.\n2. Femoral External Rotation: 'Screw your feet into the floor' to create torque through the hip joint capsule.\n3. Spinal Bracing: Take a deep diaphragmatic breath into the belt and expand 360 degrees before beginning descent.\n4. Depth: Hip crease below top of patella, maintaining a neutral lumbar spine without butt wink.",
    image: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=1200&q=80",
    userName: "Trainer",
    userImage: "https://prio.co.in/avatar.png",
    userRole: "trainer",
    userId: "6a3fd6919224486c4e78ad8e",
    createdAt: new Date("2026-09-24T18:30:00.000Z"),
    status: "approved",
    likes: ["6a3fd2bbfcfac5bfb35a347c", "6a4135589c11ec5aabb4de0b", "6a425783eaaa0a48bb426fcc"],
    dislikes: [],
    comments: []
  },

  // 12. NEW POST: CNS Recovery & Sleep
  {
    _id: new ObjectId("6a42a1019dfe3eee48bf7004"),
    title: "CNS Fatigue vs Muscle Soreness: Why Sleep Dictates 90% of Your Gains",
    description: "Delayed onset muscle soreness (DOMS) is merely localized micro-tearing of myofibrils. Central Nervous System (CNS) fatigue, however, impairs the motor cortex's ability to send electrical signals to muscles, drastically reducing force production and athletic coordination.\n\nCNS Recovery Protocols:\n1. Deep Sleep Window: Human Growth Hormone (HGH) release peaks during slow-wave Stage 3 non-REM sleep. Aim for 7.5 to 8.5 uninterrupted hours in a 65°F (18°C) pitch-black room.\n2. Micronutrient Support: 400mg Magnesium Bisglycinate + 200mg L-Theanine 45 minutes before sleep.\n3. Sympathetic Downregulation: 10 minutes of physiological sighing (double inhale through nose, long exhale through mouth) post-workout to kickstart parasympathetic tone.",
    image: "https://images.unsplash.com/photo-1511295742362-92c96b124e52?auto=format&fit=crop&w=1200&q=80",
    userName: "Mollie Porter",
    userImage: "https://prio.co.in/avatar.png",
    userRole: "admin",
    userId: "6a3fd2bbfcfac5bfb35a347c",
    createdAt: new Date("2026-09-23T20:15:00.000Z"),
    status: "approved",
    likes: ["6a4135589c11ec5aabb4de0b", "6a3fd6919224486c4e78ad8e", "6a425783eaaa0a48bb426fcc", "6a3fddbc9224486c4e78ad92"],
    dislikes: [],
    comments: [
      {
        _id: new ObjectId(),
        userId: "6a3fe0499224486c4e78ad96",
        userName: "Mona Reese",
        userImage: "https://prio.co.in/avatar.png",
        userRole: "member",
        content: "Adding magnesium bisglycinate before bed completely eliminated my nighttime calf cramps after heavy deadlift days. Excellent post!",
        likes: ["6a3fd2bbfcfac5bfb35a347c"],
        replies: [],
        createdAt: new Date("2026-09-24T06:00:00.000Z")
      }
    ]
  }
];

async function seed() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("flex_pulse");
    const forumCol = db.collection("forumPost");

    console.log("Upserting enriched forum posts...");
    for (const post of enrichedPosts) {
      await forumCol.replaceOne(
        { _id: post._id },
        post,
        { upsert: true }
      );
      console.log(`Saved: "${post.title}" by ${post.userName}`);
    }

    const totalInDb = await forumCol.countDocuments({});
    console.log(`Seeding completed successfully! Total forum posts in DB: ${totalInDb}`);
  } catch (err) {
    console.error("Seeding error:", err);
  } finally {
    await client.close();
  }
}

seed();
