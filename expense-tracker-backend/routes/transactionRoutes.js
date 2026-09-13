const express = require('express');
const router = express.Router();
const {
  getTransactions,
  getSummary,
  getTrend,
  generateRecurring,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.route('/').get(getTransactions).post(createTransaction);
router.get('/summary', getSummary);
router.get('/trend', getTrend);
router.post('/generate-recurring', generateRecurring);
router.route('/:id').put(updateTransaction).delete(deleteTransaction);

module.exports = router;