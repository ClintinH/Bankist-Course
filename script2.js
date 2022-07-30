'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-07-26T17:01:17.194Z',
    '2020-07-28T23:36:17.929Z',
    '2020-08-01T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const formatMovmentDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);
  console.log(daysPassed);
  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  else {
    // const day = `${date.getDate()}`.padStart(2, 0);
    // const month = `${date.getMonth() + 1}`.padStart(2, 0);
    // const year = date.getFullYear();
    // return `${day}/${month}/${year}`;
    return new Intl.DateTimeFormat(locale).format(date);
  }
};

const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};
const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovmentDate(date, acc.locale);

    const formattedMov = formatCur(mov, acc.locale, acc.currency);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
      <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMov}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCur(Math.abs(out), acc.locale, acc.currency);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

const startLogOutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);

    // In each call, print the remaining time to UI
    labelTimer.textContent = `${min}:${sec}`;

    // When 0 seconds, stop timer and log user out
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Log in to get started';

      containerApp.style.opacity = 0;
    }

    // decrese 1s
    time--;
  };

  // set time to 5 min
  let time = 100;
  // call the timer ever second
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};
///////////////////////////////////////
// Event handlers
let currentAccount, timer;

// Fake alway log in
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    //create current date
    const now = new Date();
    const options = {
      hour: 'numberic',
      minute: 'numberic',
      day: 'numberic',
      month: 'numeric',
      year: 'numberic',
      // weekday: 'long',
    };
    // const locale = navigator.language; // to get the locale format from browser

    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);
    //format(date you want to format)
    //Intl - International API call DateTimeFormat function with the parameters(language - country)

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    //timer
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();

    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // add Transfer date
    currentAccount.movements.push(new Date().toISOString());
    receiverAcc.movements.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);

    // reset timer
    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(function () {
      // Add movement
      currentAccount.movements.push(amount);

      // add Loan dates
      currentAccount.movements.push(new Date().toISOString());

      // Update UI
      updateUI(currentAccount);

      // reset timer
      clearInterval(timer);
      timer = startLogOutTimer();
    }, 2500);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  // displayMovements(currentAccount.movements, !sorted);
  displayMovements(acc.movements, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

// converting and checking numbers

console.log(23 === 23.0); // True
// we are used to using Base number 0 - 9. 1/10 = 0.1 & 3/10 = 3.3333333
// Binary Base 2 0's & 1's
console.log(0.1 + 0.2); //0.30000004
console.log(0.1 + 0.2); // false (should be true)
// this hapense because of the decimals that are calculated incorrectly

// String Conversion
console.log(Number('23')); // is the same as
console.log(+'23'); //When java sees + operator it does a type coersion

// Parsing
console.log(Number.parseInt('30px', 10));
//parseInt has two parameters (1,2). Second is the base number system you are working with

console.log(Number.parseInt('2.5rem')); // output with no decimal numbers 2
console.log(Number.parseFloat('2.5rem')); //output with decimal numbers 2.5

// is not a number
console.log(Number.isNaN(20)); //false
console.log(Number.isNaN(+'20X')); //true

// checking if value is a number
console.log(Number.isFinite(20)); // True
console.log(Number.isFinite('20')); //False

// checking if interger
console.log(Number.isInteger(23));
console.log(Number.isInteger(23.0));

// Math & Rounding

console.log(Math.sqrt(25)); //square root
console.log(25 ** (1 / 2)); // also square root
console.log(8 ** (1 / 3)); // cubic root

// Math.max does type coercion but not parseInt

console.log(Math.max(5, 18, 23, 11.2)); // return biggest number
console.log(Math.max(5, 18, '23', 11.2)); // return 23 (Type Coercion)
console.log(Math.max(5, 18, '23px', 11.2)); // returns NaN (does not parseInt)

// Math.min
console.log(Math.min(5, 18, 23, 11.2)); // return lowest number

// Calculate radius of circle
console.log(Math.PI * Number.parseFloat('10px') ** 2);

// creating a function to random intergers
const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min) + 1) + min;
// random creates number between 0 - 1...(Max - Min)-> generate a number between min...max
console.log(randomInt(10, 20));

// rounding Intergers
// Math.trunc - removes decimals
console.log(Math.trunc(23.3)); // return 23

// Math.round - round to the nearest integers
console.log(Math.round(23.3)); // return 23
console.log(Math.round(23.9)); // return 24

// Math.ceil - round to the nearest higher integers
console.log(Math.ceil(23.3)); // return 24
console.log(Math.ceil(23.9)); // return 24

// Math.round - round to the nearest lower integers
console.log(Math.floor(23.3)); // return 23
console.log(Math.floor(23.9)); // return 23

// Rounding Decimals
console.log((2.7).toFixed(0)); // return 3 (Type: String)
console.log((2.7).toFixed(3)); // return 2.700 (Type: String)
console.log((2.345).toFixed(2)); // return 2.35 (Type: String)
console.log(+(2.345).toFixed(2)); // return 2.35 (Type: Number)

//Remainder operator
console.log(5 % 2); // return 1
console.log(5 / 2); // 5 = 2 * 2 +1

console.log(8 % 3); // return 2
console.log(8 / 3); // 8 = 2 * 3 + 2

// Even number - even when remainder = 0
console.log(6 % 2); // return 0
console.log(6 / 2); // 6 = 2 * 3

// Odd number
console.log(7 % 2); // return 1
console.log(7 / 2); // 7 = 2 * 3 + 1

const isEven = n => n % 2 === 0;
console.log(isEven(8)); //return true
console.log(isEven(23)); //return false
console.log(isEven(514)); //return true

labelBalance.addEventListener('click', function () {
  [document.querySelectorAll('.movements_row')].forEach(function (row, i) {
    // when you want something to hapen every Nth time (i % Nth)
    if (i % 2 === 0) row.style.backgroundColor = 'orangered';
    if (i % 3 === 0) row.style.backgroundColor = 'lightorange';
  });
});

//Numeric Seperator
const diameter = 287_460_000_000;
console.log(diameter);

const price = 345_99;
console.log(price);

const transfer1 = 15_00;
const transfer2 = 1_500;

// Numeric Seperator conditions
// cant put it in front or behind the number
// can only put it in between numbers

const PI = 3.1415;
// _3._1415_ can not do it like this

// cant use with strings

// BigInt - store any large number we want
// Largest integer number that you can use in javascript

console.log(2 ** 53 - 1);
console.log(Number.MAX_SAFE_INTEGER); //9007199254740991

console.log(48948631653516534135105151044876831n); //n represent that the number is BigInt
console.log(BigInt(444444444444444444));

// Operations - has same oeprators as normal integers
console.log(10000n + 10000n);
console.log(48465184654468465165164846515464684651n * 105151354510n);
//rules
// 1) cant mix number, cant use bigInt with normal interger
// console.log(2222222222222222n + 23); //will give error
// 2) comparison operator does work and operators with strings
console.log(20n > 15);
console.log(20n === '20n');

console.log(20n + 'this is a bigInt');

// Divisions
console.log(11n / 3n); // output 3n cuts the numbers after ,

// Creating Dates
const new1 = new Date();
console.log(new1);

// can use strings
console.log(new Date('Aug 02 202 18:00'));

// can use numbers - year, month, day, hour, minutes, seconds
console.log(new Date(2037, 10, 19, 15, 23, 5));

// amount of milliseconds since the unix time

console.log(new Date(0)); // thu Jan 01 1970
// new Date(days * hours(24) * minutes(60) * seconds(60) * milliseconds(1000))
console.log(new Date(3 * 24 * 60 * 60 * 1000)); // converting 3 days to milliseconds

// Working with dates
const future = new Date(2037, 10, 19, 15, 23);
console.log(future);
console.log(future.getFullYear()); // 2037
console.log(future.getMonth()); // 10 (zero Based)
console.log(future.getDate()); // 19 (gets day)
console.log(future.getDay()); // 4 (gets day of week)
console.log(future.getHours());
console.log(future.getMinutes());
console.log(future.getseconds());
console.log(future.toISOString());
console.log(future.getTime()); // logs time passed in milliseconds (Timestamp)

// Get current Timestamp
console.log(Date.now());

// set date to value
console.log(future.setFullYear(2040));

// Operations with dates
const future2 = new Date(2037, 10, 19, 15, 23);
console.log(+future);

const calcDaysPassed = (date1, date2) =>
  Math.abs(date2 - date1) / (1000 * 60 * 60 * 24);

// const day1 = calcDaysPassed(new Date(2037, 03, 14), new Date(2037, 03, 24));
// console.log(day1);

// Intl Numbers

const num = 3884764.23;

const options = {
  style: 'currency', // 3 options Unit, Percent & Currency
  unit: 'mile per hour',
  currency: 'EUR', // have to define when currency style is chosen
};

console.log('US   ', new Intl.NumberFormat('en-US', options).format(num));
console.log('Germany   ', new Intl.NumberFormat('de-DE', options).format(num));
console.log('Seria   ', new Intl.NumberFormat('ar-SY', options).format(num));

// Timers: setTimeOut & setInterval

setTimeout(() => console.log(' Here is your Pizza'), 3000);
// 2 arguments - 1st function that will be called, 2nd time it will be called(in Miliseconds)

// parenthesis can only be call like this. Therefor the 3rd argument and so on because the parementers of the function.
setTimeout(
  (ing1, ing2) => console.log(`Here is your Pizza with ${ing1} and ${ing2}`),
  3000,
  'cheese',
  'ham'
);

// to set the parenthesis as a array and alos how o clear timeout

const ingredients = ['cheese', 'ham'];

const pizzaTimer = setTimeout(
  (ing1, ing2) => console.log(`Here is your Pizza with ${ing1} and ${ing2}`),
  3000,
  ...ingredients
);

if (ingredients.includes('cheese')) clearTimeout(pizzaTimer);
// clears the timeout so that the function doesn't get called

//setInterval
// repeats the callback after specific time set

setInterval(function () {
  const now = new Date();
  console.log(now);
}, 1000);
