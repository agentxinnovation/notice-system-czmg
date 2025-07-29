const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendNoticeEmail(to, notice) {
  const noticeUrl = `https://0hnvvn91-5173.inc1.devtunnels.ms/notice/${notice.id}`;
  
  await transporter.sendMail({
    from: `"College Notices" <${process.env.EMAIL_USER}>`,
    to,
    subject: `New Notice: ${notice.title}`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Notice</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #007bff;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #007bff;
            margin: 0;
            font-size: 28px;
          }
          .notice-title {
            color: #2c3e50;
            font-size: 24px;
            margin-bottom: 15px;
            padding: 15px;
            background-color: #f8f9fa;
            border-left: 4px solid #007bff;
            border-radius: 5px;
          }
          .notice-meta {
            background-color: #e9ecef;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
          }
          .category-badge {
            display: inline-block;
            background-color: #007bff;
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            text-transform: uppercase;
          }
          .description {
            background-color: #fff;
            padding: 20px;
            border: 1px solid #dee2e6;
            border-radius: 5px;
            margin-bottom: 25px;
            white-space: pre-line;
          }
          .cta-button {
            text-align: center;
            margin: 30px 0;
          }
          .cta-button a {
            display: inline-block;
            background-color: #007bff;
            color: white;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 5px;
            font-weight: bold;
            font-size: 16px;
            transition: background-color 0.3s ease;
          }
          .cta-button a:hover {
            background-color: #0056b3;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #dee2e6;
            color: #6c757d;
            font-size: 14px;
          }
          .published-date {
            color: #6c757d;
            font-size: 14px;
            margin-top: 10px;
          }
          @media (max-width: 600px) {
            body {
              padding: 10px;
            }
            .container {
              padding: 20px;
            }
            .notice-title {
              font-size: 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📢 College Notice</h1>
          </div>
          
          <div class="notice-title">
            ${notice.title}
          </div>
          
          <div class="notice-meta">
            <div>
              <strong>Category:</strong> 
              <span class="category-badge">${notice.category}</span>
            </div>
            ${notice.publishAt ? `
            <div class="published-date">
              <strong>Published:</strong> ${new Date(notice.publishAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
            ` : ''}
          </div>
          
          <div class="description">
            ${notice.description}
          </div>
          
          <div class="cta-button">
            <a href="${noticeUrl}" target="_blank">
              📄 View Full Notice
            </a>
          </div>
          
          <div class="footer">
            <p>This is an automated notification from the College Notice System.</p>
            <p>If you have any questions, please contact the administration.</p>
          </div>
        </div>
      </body>
      </html>
    `
  });
}
module.exports = sendNoticeEmail;