const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const sendNoticeEmail = require('../services/emailService');


// GET /api/notices/all?page=1&limit=10
exports.getAllNoticesAll = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const [notices, total] = await Promise.all([
      prisma.notice.findMany({
        skip,
        take: limit,
        orderBy: { publishAt: 'desc' }
      }),
      prisma.notice.count()
    ]);

    res.json({
      data: notices,
      page,
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/notices?page=1&limit=10
exports.getAllNotices = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const [notices, total] = await Promise.all([
      prisma.notice.findMany({
        where: { isPublished: true },
        skip,
        take: limit,
        orderBy: { publishAt: 'desc' }
      }),
      prisma.notice.count({
        where: { isPublished: true }
      })
    ]);

    res.json({
      data: notices,
      page,
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getNoticeById = async (req, res) => {
  const { id } = req.params;
  try {
    const notice = await prisma.notice.findUnique({ where: { id } });
    if (!notice) return res.status(404).json({ message: 'Notice not found' });
    res.json(notice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createNotice = async (req, res) => {
  const { title, description, category, attachmentUrl, publishAt } = req.body;
  try {
    const notice = await prisma.notice.create({
      data: {
        title,
        description,
        category,
        attachmentUrl,
        publishAt: new Date(publishAt),
        createdBy: { connect: { id: req.user.id } }
      }
    });

    res.status(201).json(notice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateNotice = async (req, res) => {
  const { id } = req.params;
  const { title, description, category, attachmentUrl, publishAt, isPublished } = req.body;

  try {
    // Get the current notice to check if it was previously unpublished
    const currentNotice = await prisma.notice.findUnique({
      where: { id }
    });

    if (!currentNotice) {
      return res.status(404).json({ error: 'Notice not found' });
    }

    // Prepare update data object
    const updateData = {
      title,
      description,
      category,
      isPublished: Boolean(isPublished) // Ensure it's a boolean
    };

    // Only add attachmentUrl if provided
    if (attachmentUrl !== undefined) {
      updateData.attachmentUrl = attachmentUrl;
    }

    // Only add publishAt if provided and valid
    if (publishAt) {
      updateData.publishAt = new Date(publishAt);
    }

    const updated = await prisma.notice.update({
      where: { id },
      data: updateData
    });

    // Send email notifications if notice is being published for the first time
    if (Boolean(isPublished) && !currentNotice.isPublished) {
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
        console.log(`Notice published and emails sent to ${students.length} students`);
      } catch (emailError) {
        console.error('Error sending emails:', emailError);
        // Don't fail the request if email sending fails
        // The notice update was successful, email is secondary
      }
    }

    res.json(updated);
  } catch (err) {
    // Handle specific Prisma errors
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Notice not found' });
    }
    
    console.error('Update notice error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteNotice = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.notice.delete({ where: { id } });
    res.json({ message: 'Notice deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
