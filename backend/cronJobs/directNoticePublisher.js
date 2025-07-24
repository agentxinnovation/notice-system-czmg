// cronJobs/directNoticePublisher.js
const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const sendNoticeEmail = require('../services/emailService');

const prisma = new PrismaClient();

// Function that mimics the updateNotice controller logic
const publishDueNoticesDirectController = async () => {
  try {
    console.log('Checking for notices to publish...');
    
    const currentTime = new Date();
    
    // Find all notices that should be published
    const dueNotices = await prisma.notice.findMany({
      where: {
        publishAt: {
          lte: currentTime
        },
        isPublished: false
      }
    });

    if (dueNotices.length === 0) {
      console.log('No notices to publish');
      return;
    }

    console.log(`Found ${dueNotices.length} notices to publish`);

    // Process each notice individually to trigger email sending
    for (const notice of dueNotices) {
      try {
        // Update the notice to published
        const updated = await prisma.notice.update({
          where: { id: notice.id },
          data: { isPublished: true }
        });

        console.log(`Published notice: ${notice.title} (ID: ${notice.id})`);

        // Send email notifications (same logic as in your controller)
        try {
          // Get all users with role 'student'
          const students = await prisma.user.findMany({
            where: { role: 'student' },
            select: { email: true }
          });

          // Send email to each student
          const emailPromises = students.map(student => 
            sendNoticeEmail(student.email, updated)
          );

          await Promise.all(emailPromises);
          console.log(`Notice published and emails sent to ${students.length} students for: ${notice.title}`);
        } catch (emailError) {
          console.error('Error sending emails for notice', notice.id, ':', emailError);
          // Continue processing other notices even if email fails
        }

      } catch (updateError) {
        console.error(`Error updating notice ${notice.id}:`, updateError);
      }
    }

  } catch (error) {
    console.error('Error in publishDueNoticesDirectController:', error);
  }
};

// Schedule the cron job
const startDirectNoticePublisherCron = () => {
  // Run every 2 minutes
  cron.schedule('*/2 * * * *', publishDueNoticesDirectController);
  console.log('Direct notice publisher cron job started - running every 2 minutes');
};

module.exports = {
  publishDueNoticesDirectController,
  startDirectNoticePublisherCron
};