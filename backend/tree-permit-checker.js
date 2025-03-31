require('dotenv').config();

const axios = require('axios');
const admin = require('firebase-admin');
const cron = require('node-cron');


// ------------------ Firebase Initialization ---------------------
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();



// ------------------ Smoove API Client ---------------------
const SMOOVE_API_URL = process.env.SMOOVE_API_URL;
const SMOOVE_API_KEY = process.env.SMOOVE_API_KEY;

const smooveClient = {
  sendNotification: async (users, permitData) => {
    try {
      const emails = users.map(user => user.email);
      
      const response = await axios.post(
        SMOOVE_API_URL,
        {
          subject: `התראה חדשה: רישיון ${permitData.licenseType || 'כריתה/העתקה'} ב${permitData.settlement}`,
          body:
           `
          <div style="direction: rtl; text-align: right; font-family: Arial, sans-serif; color: #333; line-height: 1.6; padding: 10px;">
            <h2 style="font-size: 20px; margin-bottom: 20px;">שלום,</h2>
            <p style="font-size: 16px; margin-bottom: 12px;">
              רישיון חדש פורסם ביישוב: <strong>${permitData.settlement}</strong>
            </p>
            <p style="font-size: 16px; margin-bottom: 12px;">
              <strong>כתובת:</strong> ${permitData.address || 'לא צוין'}${permitData.houseNumber ? ', ' + permitData.houseNumber : ''}
            </p>
            <p style="font-size: 16px; margin-bottom: 12px;">
              <strong>פרטי העצים:</strong> ${permitData.treeNotes?.length || 'לא צוין'} עץ/ים
            </p>
            <p style="font-size: 16px; margin-bottom: 12px;">
              <strong>סיבה:</strong> ${permitData.reasonShort || 'לא צוין'}
            </p>
            <p style="font-size: 16px; margin-bottom: 12px;">
              <strong>פרטי הסיבה:</strong> ${permitData.reasonDetailed || 'לא צוין'}
            </p>
            <p style="font-size: 16px; margin-bottom: 12px;">
              <strong>תאריך אחרון להגשת ערר:</strong> 
              ${permitData.dates?.lastDateToObject ? new Date(permitData.dates.lastDateToObject).toLocaleDateString('he-IL') : 'לא צוין'}
            </p>
        
            <p style="font-size: 16px; margin-bottom: 20px;">
              <a href="https://drive.google.com/file/d/1hwhK16zMaZ3sR602EpjUaQBAVZh7_ipx/view" style="color: #007bff; text-decoration: none;">איך מגישים ערר?</a>
            </p>
        
            <hr style="border: 0; height: 1px; background-color: #ccc; margin: 20px 0;">
            <p style="font-size: 14px; color: #555;">
              בברכה,<br>
              <strong>צוות מערכת רישיונות הכריתה</strong><br>
              <span style="color: #74c59f; font-weight: bold;">עמותת רחובות של עצים</span>
            </p>
          </div>
        `,
        

          
        
          toMembersByEmail: emails
        },
        {
          headers: {
            'Authorization': `Bearer ${SMOOVE_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`✅ Smoove notification sent to ${emails.length} users:`, response.data);
    } catch (error) {
      console.error('❌ Error sending Smoove notification:', error.response?.data || error.message);
    }
  }
};

// ------------------ API and Firestore Configuration ---------------------
const API_URL = 'https://tree-permit-api-87iy9v0x.ew.gateway.dev/tree-permits';
const PERMITS_COLLECTION = 'permits';

// ------------------ Main Functions ---------------------

// Fetch permits from API
async function fetchPermits() {
  try {
    const response = await axios.get(API_URL, {
      params: {
        page: 1,
        pageSize: 20,
        sortBy: 'lastDateToObject'
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('❌ Error fetching permits:', error.message);
    return [];
  }
}

// Check for new permits (by ID)
async function findNewPermits(permits) {
  const newPermits = [];

  for (const permit of permits) {
    const permitRef = db.collection(PERMITS_COLLECTION).doc(permit.id);
    const permitDoc = await permitRef.get();

    if (!permitDoc.exists) {
      newPermits.push(permit);
    }
  }

  return newPermits;
}

// Store only IDs of new permits in Firestore
async function storeNewPermits(permits) {
  const batch = db.batch();

  for (const permit of permits) {
    const permitRef = db.collection(PERMITS_COLLECTION).doc(permit.id);
    batch.set(permitRef, {
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      settlement: permit.settlement || 'לא צוין'
    });
  }

  await batch.commit();
  console.log(`✅ Stored ${permits.length} new permits in Firestore`);
}

// Find users subscribed to a specific settlement (via notifications collection)
async function findSubscribedUsers(settlement) {
  if (!settlement) return [];

  try {
    const notificationsSnapshot = await db.collection('notifications')
      .where('subscribedCities', 'array-contains', settlement)
      .get();

      const users = notificationsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: data.userId, 
          email: data.userEmail, 
          name: data.userEmail 
        };
      });
  
      console.log(`✅ Found ${users.length} subscribed users for ${settlement}`);
      return users;
  
    } catch (error) {
      console.error(`❌ Error finding users for ${settlement}:`, error.message);
      return [];
    }

}

// Send notifications for new permits
async function sendNotifications(newPermits) {
  for (const permit of newPermits) {
    if (!permit.settlement) {
      console.log(`⚠️ Skipping permit ${permit.id} - no settlement`);
      continue;
    }

    const users = await findSubscribedUsers(permit.settlement);

    if (users.length > 0) {
      await smooveClient.sendNotification(users, permit);
    } else {
      console.log(`ℹ️ No subscribers for ${permit.settlement} (permit ${permit.id})`);
    }
  }
}

// ------------------ Main Process ---------------------

async function checkForNewPermits() {
  console.log('🚀 Starting permit check:', new Date().toISOString());

  try {
    const permits = await fetchPermits();
    console.log(`✅ Fetched ${permits.length} permits`);

    const newPermits = await findNewPermits(permits);
    console.log(`🆕 Found ${newPermits.length} new permits`);

    if (newPermits.length > 0) {
      await storeNewPermits(newPermits);
      await sendNotifications(newPermits);
    }

    console.log('✅ Permit check completed');
  } catch (error) {
    console.error('❌ Error in permit check:', error.message);
  }
}

// ------------------ Cron Job ---------------------

cron.schedule('0 9 * * *', () => {
  checkForNewPermits();
});

cron.schedule('00 17 * * *', () => {
  checkForNewPermits();
});


console.log('🌳 Tree permit checker started, scheduled for 9AM & 5PM daily');

// ------------------ Command-line options ---------------------

if (process.argv.includes('--run-now')) {
  checkForNewPermits();
}

if (process.argv.includes('--single-run')) {
  checkForNewPermits().then(() => {
    console.log('✅ Single run done, exiting.');
    process.exit(0);
  }).catch(err => {
    console.error('❌ Single run error:', err.message);
    process.exit(1);
  });
}

module.exports = { checkForNewPermits };
