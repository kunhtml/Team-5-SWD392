const {
  Wallet,
  WalletTransaction,
  WithdrawalRequest,
  User,
} = require("../models");
const { Op } = require("sequelize");
const https = require("https");

const getWalletBalance = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ where: { user_id: req.user.id } });

    if (!wallet) {
      // Create wallet if not exists
      const newWallet = await Wallet.create({
        user_id: req.user.id,
        balance: 0.0,
      });
      return res.json({ balance: newWallet.balance, currency: "VND" });
    }

    res.json({ balance: wallet.balance, currency: "VND" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const deposit = async (req, res) => {
  try {
    const { amount, payment_method } = req.body; // payment_method: 'card', 'bank_transfer', etc.

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const wallet = await Wallet.findOne({ where: { user_id: req.user.id } });
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    const newBalance = wallet.balance + parseFloat(amount);

    // For simplicity, assume deposit succeeds (in real app, integrate payment gateway)
    await wallet.update({ balance: newBalance });

    const transaction = await WalletTransaction.create({
      wallet_id: wallet.id,
      type: "deposit",
      amount: parseFloat(amount),
      description: `Deposit via ${payment_method}`,
      balance_after: newBalance,
      reference_id: `deposit_${Date.now()}`,
    });

    res.json({
      message: "Deposit successful",
      balance: newBalance,
      transaction,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const withdraw = async (req, res) => {
  try {
    if (req.user.role !== "florist") {
      return res.status(403).json({ message: "Only florists can withdraw" });
    }

    const { amount, bank_account, bank_name, notes } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const wallet = await Wallet.findOne({ where: { user_id: req.user.id } });
    if (!wallet || wallet.balance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Create withdrawal request (admin approval needed)
    const withdrawal = await WithdrawalRequest.create({
      user_id: req.user.id,
      amount,
      bank_account,
      bank_name,
      notes,
      status: "pending",
    });

    res.status(201).json({
      message: "Withdrawal request submitted",
      withdrawal,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, start_date, end_date } = req.query;
    const offset = (page - 1) * limit;

    const wallet = await Wallet.findOne({ where: { user_id: req.user.id } });
    if (!wallet) {
      return res.json({ transactions: [], total: 0 });
    }

    const where = { wallet_id: wallet.id };
    if (type) where.type = type;
    if (start_date || end_date) {
      where.created_at = {};
      if (start_date) where.created_at[Op.gte] = start_date;
      if (end_date) where.created_at[Op.lte] = end_date;
    }

    const { count, rows } = await WalletTransaction.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
    });

    res.json({
      transactions: rows,
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getWithdrawalRequests = async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "florist") {
      return res.status(403).json({ message: "Access denied" });
    }

    const where = req.user.role === "florist" ? { user_id: req.user.id } : {};
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    if (status) where.status = status;

    const { count, rows } = await WithdrawalRequest.findAndCountAll({
      where,
      include: [
        { model: User, as: "user", attributes: ["id", "name", "email"] },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
    });

    res.json({
      requests: rows,
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Helper: fetch Sepay transactions list
function fetchSepayTransactions() {
  return new Promise((resolve, reject) => {
    const apiKey =
      process.env.SEPAY_API_KEY || process.env.SEPAY_API_TOKEN || "";
    if (!apiKey) {
      return reject(new Error("Missing SEPAY_API_KEY/SEPAY_API_TOKEN"));
    }
    const options = {
      method: "GET",
      headers: {
        // Per SePay docs: Authorization: Bearer <API_TOKEN>
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    };

    const req = https.request(
      "https://my.sepay.vn/userapi/transactions/list",
      options,
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const json = JSON.parse(data);
            resolve(json);
          } catch (e) {
            reject(new Error("Invalid JSON from Sepay"));
          }
        });
      }
    );

    req.on("error", (err) => reject(err));
    req.end();
  });
}

// Verify deposit by checking Sepay transactions list for a matching descriptor (des)
const verifyDeposit = async (req, res) => {
  try {
    const { descriptor, amount } = req.body;
    if (!descriptor)
      return res.status(400).json({ message: "Missing descriptor" });

    const wallet = await Wallet.findOne({ where: { user_id: req.user.id } });
    if (!wallet) return res.status(404).json({ message: "Wallet not found" });

    // Fetch transactions from Sepay
    const sepayData = await fetchSepayTransactions();
    const list = Array.isArray(sepayData?.transactions)
      ? sepayData.transactions
      : Array.isArray(sepayData?.data)
      ? sepayData.data
      : Array.isArray(sepayData)
      ? sepayData
      : [];

    // Helper to normalize strings: lowercase and remove non-alphanumeric (banks may drop '+', punctuation, etc.)
    const normalize = (s) =>
      String(s || "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
    const target = normalize(descriptor);

    // Normalize fields across possible keys and compare with normalized target
    const match = list.find((tx) => {
      const rawDesc =
        tx.transaction_content ||
        tx.description ||
        tx.des ||
        tx.content ||
        tx.note ||
        "";
      const descNorm = normalize(rawDesc);
      const amtIn = Number(tx.amount_in || 0);
      const okDesc = descNorm.includes(target);
      const okAmt = amount
        ? Math.round(amtIn) === Math.round(Number(amount))
        : true;
      const okIncoming = amtIn > 0; // only consider incoming transactions
      return okDesc && okAmt && okIncoming;
    });

    if (!match) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy giao dịch phù hợp" });
    }

    // Idempotency: do not double-credit if we've already recorded this remote transaction
    const refId = `sepay_${
      match.id ||
      match.reference_number ||
      match.trans_id ||
      match.code ||
      match.reference ||
      Date.now()
    }`;
    const existed = await WalletTransaction.findOne({
      where: { wallet_id: wallet.id, reference_id: refId },
    });
    if (existed) {
      return res.json({
        message: "Giao dịch đã được xác nhận trước đó",
        balance: wallet.balance,
      });
    }

    const creditAmount = Number(amount || match.amount_in || 0);
    if (!creditAmount || creditAmount <= 0) {
      return res
        .status(400)
        .json({ message: "Số tiền giao dịch không hợp lệ" });
    }

    const newBalance = Number(wallet.balance) + creditAmount;
    await wallet.update({ balance: newBalance });

    const transaction = await WalletTransaction.create({
      wallet_id: wallet.id,
      type: "deposit",
      amount: creditAmount,
      description: `Sepay deposit: ${descriptor}`,
      balance_after: newBalance,
      reference_id: refId,
      metadata: { raw: match },
    });

    res.json({
      message: "Xác nhận nạp tiền thành công",
      balance: newBalance,
      transaction,
    });
  } catch (error) {
    console.error("verifyDeposit error:", error);
    res.status(502).json({ message: "Không thể kiểm tra giao dịch Sepay" });
  }
};

const processWithdrawal = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admins can process withdrawals" });
    }

    const { id } = req.params;
    const { status, notes } = req.body; // 'approved', 'rejected', 'processed'

    const withdrawal = await WithdrawalRequest.findByPk(id, {
      include: "user",
    });
    if (!withdrawal) {
      return res.status(404).json({ message: "Withdrawal request not found" });
    }

    if (withdrawal.status !== "pending") {
      return res.status(400).json({ message: "Request is not pending" });
    }

    const user = withdrawal.user;
    const wallet = await Wallet.findOne({ where: { user_id: user.id } });

    if (status === "approved" || status === "processed") {
      if (!wallet || wallet.balance < withdrawal.amount) {
        return res
          .status(400)
          .json({ message: "Insufficient balance for processing" });
      }

      // Deduct from wallet
      await wallet.update({ balance: wallet.balance - withdrawal.amount });

      // Create transaction
      await WalletTransaction.create({
        wallet_id: wallet.id,
        type: "withdrawal",
        amount: -withdrawal.amount,
        description: `Withdrawal processed #${withdrawal.id}`,
        balance_after: wallet.balance,
        reference_id: `withdrawal_${withdrawal.id}`,
      });
    }

    await withdrawal.update({
      status,
      notes,
      processed_at: new Date(),
    });

    res.json({ message: `Withdrawal ${status} successfully`, withdrawal });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Debug: return Sepay transactions (limit or full)
const sepayTransactionsDebug = async (req, res) => {
  try {
    const data = await fetchSepayTransactions();
    res.json(data);
  } catch (err) {
    console.error("sepayTransactionsDebug error:", err);
    res.status(502).json({ message: "Không thể gọi Sepay" });
  }
};

// Admin-only function to deposit money into a specific wallet (for order completions)
const depositToWallet = async (req, res) => {
  try {
    // Only admins can use this function
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { walletId } = req.params;
    const { amount, description } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const wallet = await Wallet.findByPk(walletId);
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    const newBalance = Number(wallet.balance) + Number(amount);

    // Update wallet balance
    await wallet.update({ balance: newBalance });

    // Create transaction record
    const transaction = await WalletTransaction.create({
      wallet_id: wallet.id,
      type: "deposit",
      amount: Number(amount),
      description: description || `Admin deposit to wallet #${walletId}`,
      balance_after: newBalance,
      reference_id: `admin_deposit_${Date.now()}_${walletId}`,
    });

    res.json({
      message: "Deposit successful",
      balance: newBalance,
      transaction,
    });
  } catch (error) {
    console.error("depositToWallet error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getWalletBalance,
  deposit,
  withdraw,
  getTransactions,
  getWithdrawalRequests,
  processWithdrawal,
  verifyDeposit,
  sepayTransactionsDebug,
  depositToWallet, // Add the new function to exports
};
