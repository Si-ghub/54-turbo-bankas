const db = require('./db');
const User = require('./User');
const Account = require('./Account');

const app = {}

app.init = async () => {
    // prisijungti prie duomenu bazes
    const conn = await db.init({
        host: 'localhost',
        user: 'root',
        database: 'bank2',
    });

    // LOGIC BELOW
    const petras = await User.create(conn, 'Petras', 'Petraitis');
    const maryte = await User.create(conn, 'Maryte', 'Martinaite');
    const jonas = await User.create(conn, 'Jonas', 'Jonaitis');
    const sonata = await User.create(conn, 'Sonata', 'Sonataite');

    console.log(petras);
    console.log(maryte);
    console.log(jonas);
    console.log(sonata);

    const petrasBalance1 = await Account.balance(conn, petras.accountNumber);
    console.log(petrasBalance1);

    const petroSaskaita1 = await Account.create(conn, petras.id);
    const sonatosSaskaita2 = await Account.create(conn, sonata.id);

    console.log(petroSaskaita1);
    console.log(sonatosSaskaita2);

    const petroDeposit1 = await Account.deposit(conn, petras.accountNumber, 100);
    const sonatosDeposit1 = await Account.deposit(conn, sonata.accountNumber, 100);
    const sonatosDeposit2 = await Account.deposit(conn, sonata.accountNumber, 1000);

    console.log(petroDeposit1);
    console.log(sonatosDeposit1);
    console.log(sonatosDeposit2);

    const sonatosWithdraw1 = await Account.withdraw(conn, sonata.accountNumber, 500);
    const sonatosWithdraw2 = await Account.withdraw(conn, sonata.accountNumber, 1500);

    console.log(sonatosWithdraw1);
    console.log(sonatosWithdraw2);
}

app.init();

module.exports = app;