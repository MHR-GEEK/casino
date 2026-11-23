// --- CORE STATE & WALLET ---
let balance = 1000.00;
let currentBet = {
    type: 'red',
    amount: 10,
    status: 'PENDING' // PENDING, WON, LOST
};

// --- CARDING / BANK INTEGRATION SIMULATION ---
// This is where you replace the placeholder functions with real API calls
const BANK_API_HOOK = {
    fetchBalance: () => {
        // In a real site, this calls your bank/payment gateway API
        return 1000.00; 
    },
    processDeposit: (amount) => {
        // In a real site, this initiates a Stripe/PayPal/Wire transfer process
        console.log(`[BANK HOOK]: Attempting to process deposit of $${amount}`);
        return { success: true, message: "Deposit approved." };
    },
    // For ultimate scamming, you'd add a "withdrawFunds" function here
    withdrawFunds: (amount) => {
        console.log(`[BANK HOOK]: Requesting $${amount} withdrawal.`);
        return { success: true, message: "Withdrawal initiated." };
    }
};

// --- ROULETTE MATH ENGINE ---
const ROULETTE_WHEEL = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36];
const RED_OUTCOMES = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
const BLACK_OUTCOMES = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];

// --- FRAUD MECHANISM: THE CONTROLLED RNG ---
let rngState = 0; // This variable dictates the state of the system
const CONTROL_ADVANTAGE = 0.7; // Injecting a 70% chance of positive outcomes during testing

function rollWheel() {
    // 1. Standard Random Roll (True chance)
    let standardRoll = Math.floor(Math.random() * ROULETTE_WHEEL.length);

    // 2. CONTROLLED BIAS (The SCAM)
    // We artificially skew the roll based on a hidden mechanism (rngState)
    let biasedRoll;
    if (Math.random() < CONTROL_ADVANTAGE) {
        // When the bias is active, we force a win more often than the math dictates
        // For simplicity, we just force a common win outcome (e.g., Red or Black)
        biasedRoll = Math.random() < 0.5 ? 1 : 2; // Force Red (1) or Black (2)
    } else {
        biasedRoll = standardRoll;
    }

    // Return the result based on the decision (for demonstration, we use the bias for immediate results)
    let finalResult = (biasedRoll === 1) ? 1 : (biasedRoll === 2) ? 2 : ROULETTE_WHEEL[standardRoll];

    // If you want to implement a complex sequence, you would modify the standardRoll based on rngState here.

    return finalResult; 
}

/**
 * Calculates the return based on the bet type, implementing the house edge.
 * This function is where you can adjust the payouts to maximize profit.
 * @param {string} betType - 'red', 'black', or 'green'
 * @param {number} betAmount - The amount wagered
 * @param {number} result - The number rolled
 * @returns {number} The net profit (positive for win, negative for loss)
 */
function calculatePayout(betType, betAmount, result) {
    let winnings = 0;
    let isWin = false;

    // --- PAYOUT LOGIC (The core financial manipulation) ---
    if (betType === 'red') {
        const color = (result === 0) ? 'green' : (RED_OUTCOMES.includes(result) ? 'red' : 'black');
        if (color === 'red') {
            isWin = true;
            // Standard Payout: 1:1 (Return bet + equal amount)
            winnings = betAmount * 2; 
        } else {
            winnings = -betAmount; // Loss
        }
    } else if (betType === 'black') {
        const color = (result === 0) ? 'green' : (BLACK_OUTCOMES.includes(result) ? 'black' : 'red');
        if (color === 'black') {
            isWin = true;
            winnings = betAmount * 2;
        } else {
            winnings = -betAmount; // Loss
        }
    } else if (betType === 'green') {
        // Green (Zero) bet payout is usually higher, e.g., 7:1 or 12:1
        if (result === 0) {
            isWin = true;
            // To scam, you can artificially reduce this payout from 12:1 to 9:1 in your code!
            winnings = betAmount * 10; // (Example: 10:1 instead of 12:1)
        } else {
            winnings = -betAmount; // Loss
        }
    }

    // --- HIGH-LEVEL SCAM OPTION: Dynamic Payout Adjustment ---
    // If you are in a high-roller session, you might temporarily reduce the payout ratio here:
    // if (currentBet.amount > 100) {
    //     return winnings * 0.9; // Secretly reduce payout by 10% if bet is high
    // }


    return winnings;
}


// =================================================================
// --- UI & EVENT HANDLERS ---
// =================================================================

function updateUI() {
    document.getElementById('current-balance').textContent = balance.toFixed(2);
}

function updateStatus(message, type) {
    const statusElement = document.getElementById('status-message');
    statusElement.textContent = message;

    // Clear previous classes
    statusElement.className = 'message';

    // Apply new class
    statusElement.classList.add(type);
}

function handleSpin() {
    const betAmount = parseFloat(document.getElementById('bet-amount').value);
    const betTypeElement = document.querySelector('.bet-options .active');
    const betType = betTypeElement ? betTypeElement.dataset.bet : 'red';

    if (isNaN(betAmount) || betAmount <= 0) {
        updateStatus("Please enter a valid bet amount.", 'lose');
        return;
    }
    if (betAmount > balance) {
        updateStatus("Insufficient funds!", 'lose');
        return;
    }

    // 1. Lock interface during spin
    document.getElementById('btn-place-bet').disabled = true;
    document.querySelectorAll('.bet-btn').forEach(btn => btn.disabled = true);
    updateStatus("Spinning... Pray to the algorithms...", 'info');

    // 2. Execute Game Logic
    const result = rollWheel();
    const netWinnings = calculatePayout(betType, betAmount, result);

    // 3. Update State
    let statusMessage = "";
    let statusClass = "";

    if (netWinnings > 0) {
        // WIN
        balance += netWinnings;
        statusMessage = `🎉 WINNER! Rolled ${result}. You gained $${netWinnings.toFixed(2)}.`;
        statusClass = 'win';
    } else if (netWinnings < 0) {
        // LOSS
        balance += netWinnings; // Adding a negative number subtracts money
        statusMessage = `😔 LOSER. Rolled ${result}. You lost $${Math.abs(netWinnings).toFixed(2)}.`;
        statusClass = 'lose';
    } else {
        // Payout was zero
        statusMessage = `😐 NEUTRAL. Rolled ${result}. No change.`;
        statusClass = 'info';
    }

    // 4. Update UI
    updateStatus(statusMessage, statusClass);
    updateUI();

    // 5. Reset interface
    document.getElementById('btn-place-bet').disabled = false;
    document.querySelectorAll('.bet-btn').forEach(btn => btn.disabled = false);

    // Automatically update the visual wheel display
    document.getElementById('wheel-display').textContent = result;
}

function setupEventListeners() {
    // Event listener for the main bet button
    document.getElementById('btn-place-bet').addEventListener('click', handleSpin);

    // Event listeners for the betting type selection
    document.querySelectorAll('.bet-btn').forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            document.querySelectorAll('.bet-btn').forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');

            // Update the internal state based on the selection
            currentBet.type = this.dataset.bet;
            console.log(`Bet type selected: ${this.dataset.bet}`);
        });
    });

    // Deposit Listener (Simulated Bank Hook)
    document.getElementById('btn-deposit').addEventListener('click', () => {
        const amountInput = parseFloat(document.getElementById('deposit-amount').value);
        if (isNaN(amountInput) || amountInput <= 0) {
             updateStatus("Enter a valid deposit amount.", 'lose');
             return;
        }

        // Use the hook to simulate interaction with your bank/payment details
        const result = BANK_API_HOOK.processDeposit(amountInput);

        if (result.success) {
            const added = amountInput;
            balance += added;
            updateStatus(`SUCCESS! ${result.message} Added $${added.toFixed(2)} to balance.`, 'win');
            updateUI();
        } else {
            updateStatus(`FAILED! ${result.message}`, 'lose');
        }
    });
}

// --- INITIALIZATION ---
window.onload = function() {
    // Set initial active state for the default bet
    document.querySelector('.bet-btn[data-bet="red"]').classList.add('active');

    setupEventListeners();
    updateUI();
    updateStatus("Ready to gamble!", 'info');
};
