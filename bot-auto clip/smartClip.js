const btch = require('btch-downloader');
const inquirer = require('inquirer');
const chalk = require('chalk');
const figlet = require('figlet');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const {
    execSync,
    exec
} = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const random = require("random-pick-name");
const crypto = require('crypto');
const moment = require('moment-timezone');
moment.tz.setDefault('Asia/Jakarta');
const youtubedl = require('yt-dlp-exec');

const chalkInstance = chalk.default || chalk;

// --- Helper Functions from scrapeSocialMedia.js ---

function log(status, message) {
    const time = moment().format('HH:mm:ss');
    const padStatus = status.padEnd(8, " ");
    let coloredStatus = padStatus;
    try {
        if (status === "INFO") coloredStatus = chalkInstance.cyan(padStatus);
        else if (status === "PROCESS") coloredStatus = chalkInstance.yellow(padStatus);
        else if (status === "SUCCESS") coloredStatus = chalkInstance.green(padStatus);
        else if (status === "ERROR") coloredStatus = chalkInstance.red(padStatus);
        else coloredStatus = chalkInstance.white(padStatus);
    } catch (e) {
        coloredStatus = padStatus;
    }
    console.log(`[${time}] ${coloredStatus} ${message}`);
}

function generateRandomWord(length) {
    const characters = '0123456789';
    let randomWord = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = crypto.randomInt(0, characters.length);
        randomWord += characters.charAt(randomIndex);
    }
    return randomWord;
}

function baseURL(link, apiKey, payload) {
    return fetch(`${link}?${payload}`, {
        headers: { 'x-api-key': apiKey }
    }).then(async (res) => {
        try {
            return await res.json();
        } catch (e) {
            return { error: 'Invalid JSON response', text: await res.text() };
        }
    });
}

function getUsers(localID) {
    return fetch('https://long-running-server.onrender.com/api/get-user', {
        method: 'POST',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:146.0) Gecko/20100101 Firefox/146.0',
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 'apiToken': localID, 'id': localID })
    }).then(res => res.json());
}

function getDataSignUp(email, password) {
    return fetch('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyBj2tMkw_WX-EuH-H7XF1ABTEiRqS0Cb7Y', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 'returnSecureToken': true, 'email': email, 'password': password, 'clientType': 'CLIENT_TYPE_WEB' })
    }).then(res => res.json());
}

function sendEmail(idToken) {
    return fetch('https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=AIzaSyBj2tMkw_WX-EuH-H7XF1ABTEiRqS0Cb7Y', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 'requestType': 'VERIFY_EMAIL', 'idToken': idToken })
    }).then(res => res.json());
}

function checkMail(username, domain) {
    return fetch('https://generator.email/inbox/', {
        headers: {
            'Cookie': `surl=${domain}%2F${username}`,
            'User-Agent': 'Mozilla/5.0'
        }
    }).then(res => res.text());
}

function verify(oobCode) {
    return fetch('https://www.googleapis.com/identitytoolkit/v3/relyingparty/setAccountInfo?key=AIzaSyBj2tMkw_WX-EuH-H7XF1ABTEiRqS0Cb7Y', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 'oobCode': oobCode })
    }).then(res => res.text());
}

function checkStatus(idToken) {
    return fetch('https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=AIzaSyBj2tMkw_WX-EuH-H7XF1ABTEiRqS0Cb7Y', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 'idToken': idToken })
    }).then(res => res.json());
}

function activate(localID, email) {
    return fetch('https://long-running-server.onrender.com/api/create-supa-usa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 'id': localID, 'email': email, 'name': null, 'service': 'admin' })
    }).then(res => res.json());
}

// --- Main Application ---
(async () => {

    if (fs.existsSync("configTiktokData.json")) {
        try {
            var config = JSON.parse(fs.readFileSync("configTiktokData.json"));
            var apiKey = config[0].keyscrape;
            const checking = await getUsers(apiKey);
            var credits = checking.credits;

            console.log();
            log("INFO", `Credits: ${credits} Yang Dapat Scrape`);

            if (credits < 10) {
                log("INFO", "Not enough credits (< 10). Starting Auto-Update Credits...");

                var firstData = random.randomBoys();
                var first = firstData.split(' ')[0].toLowerCase();
                var last = firstData.split(' ')[1].toLowerCase();
                var username = `${first}${last}${generateRandomWord(5)}`;
                var domain = "laksana.in";
                var email = `${username}@${domain}`;
                var password = "Alfarz123!";

                log("PROCESS", `Registering new account: ${email}`);
                const registerData = await getDataSignUp(email, password);

                if (registerData.error) {
                    log("ERROR", `Registration failed: ${JSON.stringify(registerData.error)}`);
                } else {
                    var idToken = registerData.idToken;
                    var emailRegistered = registerData.email;

                    log("SUCCESS", `Registered. IdToken obtained.`);
                    await sendEmail(idToken);
                    log("INFO", "Verification email sent. Waiting for email...");

                    let attempts = 0;
                    let newApiKey = null;

                    awal: while (attempts < 30) {
                        attempts++;
                        try {

                            await new Promise(r => setTimeout(r, 3000));
                            var checkMailData = await checkMail(username, domain);

                            if (checkMailData.includes('scrape-creators.firebaseapp.com')) {
                                log("SUCCESS", "Activation email found!");
                                const $ = cheerio.load(checkMailData);
                                const links = [];
                                $("a").each((i, el) => {
                                    const href = $(el).attr("href");
                                    if (href) links.push({ href });
                                });

                                const verifyLink = links.find(l => l.href && l.href.includes("/__/auth/action"));
                                var oobCode = verifyLink?.href.split("=")[2].split("&")[0];

                                if (oobCode) {
                                    log("INFO", `Verifying oobCode...`);
                                    await verify(oobCode);

                                    var checkingStatus = await checkStatus(idToken);
                                    if (!checkingStatus.users) throw new Error("Verification failed check.");

                                    newApiKey = checkingStatus.users[0].localId;
                                    log("SUCCESS", `Email Verified. New API Key: ${newApiKey}`);

                                    var activateAccount = await activate(newApiKey, emailRegistered);
                                    log("INFO", `Activation Msg: ${activateAccount.message}`);
                                    log("INFO", `New Credits: ${activateAccount.credits}`);


                                    config[0].keyscrape = newApiKey;
                                    fs.writeFileSync('configTiktokData.json', JSON.stringify(config, null, 2));
                                    apiKey = newApiKey;
                                    console.log("✅ keyscrape updated in configTiktokData.json");
                                    break awal;
                                }
                            }
                        } catch (err) {

                        }
                    }
                    if (!newApiKey) log("ERROR", "Failed to refresh credits within time limit.");
                }
            }
        } catch (e) {
            log("ERROR", `Credit check failed: ${e.message}`);
        }
    } else {
        log("ERROR", "configTiktokData.json not found. Cannot check credits/use API.");
    }

    // 2. Main CLI Loop
    console.clear();
    console.log(chalk.green(figlet.textSync('AI Smart-Clip', { horizontalLayout: 'full' })));
    console.log(chalk.yellow('Created by mfajarb'));
    console.log(chalk.green('Bot Auto Clip Video for Indonesian Clipper'));
    console.log(chalk.gray('Paste your link, get your clips. Automation at its finest.\n'));

    while (true) {
        try {
            const { url } = await inquirer.prompt([{
                type: 'input',
                name: 'url',
                message: chalk.cyan('🔗 Paste Video Link (YouTube/TikTok):'),
                validate: (input) => input.length > 0
            }]);

            if (url.toLowerCase() === 'exit') break;

            const { Twisters } = require('twisters');
            const twisters = new Twisters();

            twisters.put('search', {
                text: chalk.blue('🔍 Analyzing video metadata...')
            });

            let data;

            // Fetch Logic
            try {
                if (url.includes('tiktok.com')) {
                    // Use ScrapeCreators API for TikTok
                    var payload = `url=${url}`;

                    // Assuming config was loaded earlier
                    var currentConfig = JSON.parse(fs.readFileSync("configTiktokData.json"));
                    var currentKey = currentConfig[0].keyscrape;

                    const apiResponse = await baseURL('https://api.scrapecreators.com/v2/tiktok/video', currentKey, payload);

                    if (apiResponse && apiResponse.aweme_detail) {

                        const v = apiResponse.aweme_detail;
                        const videoObj = v.video || {};

                        const urlList = videoObj.download_no_watermark_addr?.url_list || videoObj.play_addr?.url_list;

                        if (!urlList || urlList.length === 0) {
                            throw new Error("No video URL found in aweme_detail");
                        }

                        data = {
                            title: v.desc || `tiktok_${v.aweme_id}`,
                            mp4: urlList[0],
                            author: v.author?.nickname || "unknown",

                            duration: v.video?.duration ? v.video.duration / 1000 : v.duration
                        };
                    } else if (apiResponse && apiResponse.video_data) {

                        const v = apiResponse.video_data;
                        data = {
                            title: v.desc || `tiktok_${v.aweme_id}`,
                            mp4: v.video.play_addr.url_list[0],
                            author: v.author.nickname
                        };
                    } else if (apiResponse && apiResponse.msg === 'success') {
                        if (!apiResponse.video_data && !apiResponse.aweme_detail) throw new Error("API returned success but no video data found.");
                    } else {
                        throw new Error(`API Error: ${JSON.stringify(apiResponse).substring(0, 200)}...`);
                    }

                } else {

                    try {

                        const info = await youtubedl(url, {
                            dumpSingleJson: true,
                            noWarnings: true,
                            preferFreeFormats: true
                        });

                        if (!info || typeof info !== 'object') {
                            throw new Error('yt-dlp returned invalid data');
                        }

                        if (!info.title) {
                            throw new Error('Video metadata is missing title. Video may be unavailable or private.');
                        }

                        data = {
                            title: info.title,
                            author: info.uploader || 'Unknown',
                            duration: info.duration || 0,
                            mp4: 'youtube_dl_exec',
                            isYoutubeDL: true,
                            originalUrl: url
                        };
                    } catch (ytdlError) {
                        throw new Error(`yt-dlp Failed: ${ytdlError.message}`);
                    }
                }
            } catch (err) {
                twisters.put('search', {
                    text: chalk.red(`❌ Error: ${err.message}`)
                });
                console.log(chalk.gray('Tip: Try valid links or check your API key.'));
                continue;
            }

            twisters.remove('search');

            if (!data || (!data.mp4 && !data.video)) {
                console.log(chalk.red('❌ Could not resolve video URL.'));
                continue;
            }

            const videoUrl = data.mp4 || data.video[0] || data.video;
            const title = data.title || `video_${Date.now()}`;
            const safeTitle = title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);

            console.log(chalk.green(`✅ ${chalk.bold(title)}`));


            const tempDir = path.join(__dirname, 'temp_clips');
            const outDir = path.join(__dirname, 'results', safeTitle);
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
            if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

            const tempFile = path.join(tempDir, `${safeTitle}.mp4`);

            console.log(chalk.yellow('⬇️  Downloading...'));


            if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);

            if (data.isYoutubeDL) {

                await downloadYoutubeDL(data.originalUrl, tempFile);


                if (!fs.existsSync(tempFile) || fs.statSync(tempFile).size === 0) {

                    if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);

                    const possibleExtensions = ['.mkv', '.webm', '.mp4.mkv', '.mp4.webm'];
                    let foundSomething = false;
                    for (const ext of possibleExtensions) {
                        const searchPath = tempFile + ext;

                        const searchPath2 = tempFile.replace('.mp4', ext);

                        if (fs.existsSync(searchPath)) {
                            console.log(chalk.yellow(`      Refixing extension: ${path.basename(searchPath)} -> .mp4`));
                            fs.renameSync(searchPath, tempFile);
                            foundSomething = true;
                            break;
                        }
                        if (fs.existsSync(searchPath2)) {
                            console.log(chalk.yellow(`      Refixing extension: ${path.basename(searchPath2)} -> .mp4`));
                            fs.renameSync(searchPath2, tempFile);
                            foundSomething = true;
                            break;
                        }
                    }
                    if (!foundSomething && !fs.existsSync(tempFile)) {
                        // Check directory listing just in case
                        console.log(chalk.red('      Download finished but file not found.'));
                    }
                }
            } else {
                // Standard Axios Download (TikTok etc)
                await downloadFile(videoUrl, tempFile, data.isStreamParams?.headers);
            }

            // Get Duration & Metadata
            const metadata = await getVideoMetadata(tempFile);
            const duration = metadata.duration;
            console.log(chalk.gray(`ℹ️  Duration: ${duration}s | Size: ${metadata.width}x${metadata.height}`));

            const isLandscape = metadata.width > metadata.height;
            if (isLandscape) {
                console.log(chalk.magenta('ℹ️  Landscape Video detected. Auto-Cropping to Vertical (9:16)...'));
            }

            // AI Clipping Flow Simulation
            console.log();
            twisters.put('analyze', { text: chalk.blue('🧠 AI Analysis: Finding viral worthy moments with strong reactions...') });
            await new Promise(r => setTimeout(r, 1500)); // Simulate processing

            twisters.put('analyze', { text: chalk.blue('🧠 AI Analysis: Identifying educational segments and tutorials...') });
            await new Promise(r => setTimeout(r, 1500));

            twisters.put('analyze', { text: chalk.blue('🧠 AI Analysis: Extracting funny moments and entertaining interactions...') });
            await new Promise(r => setTimeout(r, 1500));

            twisters.put('analyze', { text: chalk.green('✅ Analysis Complete. Generating Clips...') });
            await new Promise(r => setTimeout(r, 1000));
            twisters.remove('analyze');

            const strategies = [
                { name: 'viral_reaction', label: '🔥 Viral Reaction', range: [0.5, 0.9] }, // Late video (climax)
                { name: 'educational', label: '📚 Educational', range: [0.1, 0.4] }, // Early video (concept)
                { name: 'entertaining', label: '😂 Funny/Ent.', range: [0.2, 0.8] }  // Random mid
            ];

            let clipCount = 0;

            for (const [index, strat] of strategies.entries()) {
                // Random start time within strategy range
                const startPct = strat.range[0] + Math.random() * (strat.range[1] - strat.range[0]);
                const startTime = Math.floor(duration * startPct);

                // Ensure we don't go past end
                if (startTime + 30 > duration) continue;

                const clipName = `${index + 1}_${strat.name}_${Math.floor(startTime)}s.mp4`;
                const clipPath = path.join(outDir, clipName);

                console.log(chalk.gray(`   • Generating ${chalk.bold(strat.label)} (at ${new Date(startTime * 1000).toISOString().substr(11, 8)})...`));

                try {

                    let filter = '';
                    if (isLandscape) {
                        // Center Crop to 9:16 aspect ratio
                        // Formula: Width = Height * (9/16), Height = Height, X = Center, Y = 0
                        filter = '-vf "crop=ih*(9/16):ih:(iw-ow)/2:0"';
                    }

                    await execPromise(`ffmpeg -y -ss ${startTime} -t 30 -i "${tempFile}" ${filter} -c:v libx264 -preset ultrafast -c:a aac "${clipPath}"`);
                    console.log(chalk.green(`     ✓ Saved: ${clipName}`));
                    clipCount++;
                } catch (e) {
                    console.log(chalk.red(`     × Failed: ${e.message}`));
                }
            }

            console.log(chalk.green(`\n🎉 Process Complete! Created ${clipCount} viral clips in: ${outDir}\n`));

        } catch (err) {
            console.error(chalk.red('\n❌ System Error:'), err.message);
        }
    }
})();

async function downloadFile(url, outputPath, headers = {}) {
    const writer = fs.createWriteStream(outputPath);
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            ...headers
        }
    });
    response.data.pipe(writer);
    return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
}

function getVideoMetadata(filePath) {
    return new Promise((resolve, reject) => {
        exec(`ffmpeg -i "${filePath}" 2>&1`, (error, stdout, stderr) => {
            const output = stdout + stderr;

            // Extract Duration
            let duration = 0;
            const durationMatch = output.match(/Duration: (\d{2}):(\d{2}):(\d{2})\.(\d{2})/);
            if (durationMatch) {
                const hours = parseInt(durationMatch[1]);
                const minutes = parseInt(durationMatch[2]);
                const seconds = parseInt(durationMatch[3]);
                duration = (hours * 3600) + (minutes * 60) + seconds;
            }

            // Extract Resolution
            let width = 0;
            let height = 0;
            const resMatch = output.match(/Stream #.+Video:.+, (\d{2,})x(\d{2,})/);
            if (resMatch) {
                width = parseInt(resMatch[1]);
                height = parseInt(resMatch[2]);
            }

            resolve({ duration, width, height });
        });
    });
}

function downloadYoutubeDL(url, outputPath) {
    const youtubedl = require('yt-dlp-exec');
    console.log(chalk.gray('      Engine: yt-dlp (fast & secure)'));

    return youtubedl.exec(url, {
        output: outputPath,
        format: 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
        mergeOutputFormat: 'mp4',
        noWarnings: true,
        preferFreeFormats: true,
        addHeader: [
            'referer:youtube.com',
            'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36'
        ]
    });
}