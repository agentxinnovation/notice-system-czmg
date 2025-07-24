const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/roleMiddleware');
const {
  getAllNotices,
  getAllNoticesAll,
  getNoticeById,
  createNotice,
  updateNotice,
  deleteNotice
} = require('../controllers/noticeController');

router.get('/', authMiddleware, getAllNotices);
router.get('/all', authMiddleware, getAllNoticesAll);
router.get('/:id', authMiddleware, getNoticeById);
router.post('/', authMiddleware, checkRole('admin'), createNotice);
router.put('/:id', authMiddleware, checkRole('admin'), updateNotice);
router.delete('/:id', authMiddleware, checkRole('admin'), deleteNotice);

module.exports = router;
