// cronJobs/noticePublisher.js
const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const prisma = new PrismaClient();

// Function to publish notices that are due
const publishDueNotices = async () => {
  try {
    console.log('Checking for notices to publish...');
    
    // Find all notices where publishAt <= current time and isPublished = false
    const currentTime = new Date();
    const dueNotices = await prisma.notice.findMany({
      where: {
        publishAt: {
          lte: currentTime
        },
        isPublished: false
      }
    });

    console.log(`Found ${dueNotices.length} notices to publish`);

    // Update each notice by hitting the update API
    const updatePromises = dueNotices.map(async (notice) => {
      try {
        // If you have authentication, you'll need to include proper headers
        // For now, this assumes no auth or you can modify as needed
        const response = await axios.put(`http://localhost:3000/api/notices/${notice.id}`, {
          title: notice.title,
          description: notice.description,
          category: notice.category,
          attachmentUrl: notice.attachmentUrl,
          publishAt: notice.publishAt.toISOString(),
          isPublished: true
        }, {
          headers: {
            'Content-Type': 'application/json',
            // Add authentication headers if needed
            // 'Authorization': `Bearer ${token}`
          }
        });

        console.log(`Successfully published notice: ${notice.title} (ID: ${notice.id})`);
        return { success: true, noticeId: notice.id, title: notice.title };
      } catch (error) {
        console.error(`Failed to publish notice ${notice.id}:`, error.message);
        return { success: false, noticeId: notice.id, error: error.message };
      }
    });

    const results = await Promise.allSettled(updatePromises);
    
    // Log results
    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)).length;
    
    console.log(`Publishing completed: ${successful} successful, ${failed} failed`);
    
  } catch (error) {
    console.error('Error in publishDueNotices:', error);
  }
};

// Alternative approach: Direct database update (more efficient)
const publishDueNoticesDirectly = async () => {
  try {
    console.log('Checking for notices to publish (direct method)...');
    
    const currentTime = new Date();
    
    // Get notices that need to be published before updating
    const dueNotices = await prisma.notice.findMany({
      where: {
        publishAt: {
          lte: currentTime
        },
        isPublished: false
      },
      include: {
        createdBy: true
      }
    });

    if (dueNotices.length === 0) {
      console.log('No notices to publish');
      return;
    }

    console.log(`Found ${dueNotices.length} notices to publish`);

    // Update all due notices in one go
    const updateResult = await prisma.notice.updateMany({
      where: {
        publishAt: {
          lte: currentTime
        },
        isPublished: false
      },
      data: {
        isPublished: true
      }
    });

    console.log(`Successfully published ${updateResult.count} notices`);

    // If you need to send emails, you can do it here
    // Import your email service
    const sendNoticeEmail = require('../services/emailService');
    
    // Send emails for each published notice
    for (const notice of dueNotices) {
      try {
        // Get all students
        const students = await prisma.user.findMany({
          where: { role: 'student' },
          select: { email: true }
        });

        // Send email to each student
        const emailPromises = students.map(student => 
          sendNoticeEmail(student.email, { ...notice, isPublished: true })
        );

        await Promise.all(emailPromises);
        console.log(`Emails sent for notice: ${notice.title}`);
      } catch (emailError) {
        console.error(`Error sending emails for notice ${notice.id}:`, emailError);
      }
    }
    
  } catch (error) {
    console.error('Error in publishDueNoticesDirectly:', error);
  }
};

// Schedule the cron job to run every minute
const startNoticePublisherCron = () => {
  // Run every minute
  cron.schedule('* * * * *', publishDueNoticesDirectly);
  console.log('Notice publisher cron job started - running every minute');
  
  // Alternative schedules:
  // Every 5 minutes: '*/5 * * * *'
  // Every 15 minutes: '*/15 * * * *'
  // Every hour: '0 * * * *'
  // Every day at midnight: '0 0 * * *'
};

// Alternative: Schedule to run every 5 minutes (more reasonable for production)
const startNoticePublisherCronFiveMinutes = () => {
  cron.schedule('*/1 * * * *', publishDueNoticesDirectly);
  console.log('Notice publisher cron job started - running every 1 minutes');
};

// Export functions
module.exports = {
  publishDueNotices,
  publishDueNoticesDirectly,
  startNoticePublisherCron,
  startNoticePublisherCronFiveMinutes
};

// If running this file directly
if (require.main === module) {
  startNoticePublisherCronFiveMinutes();
}