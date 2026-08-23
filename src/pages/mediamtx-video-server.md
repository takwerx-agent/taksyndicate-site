---
layout: ../layouts/Docs.astro
title: "MediaMTX Video Server"
description: "Build a video restreaming server for TAK, from a clean box to live feeds."
---

![](/images/img-045.webp)

Installation Instructions

<div class="embed"><iframe src="https://www.youtube-nocookie.com/embed/2jgHcDA8oOw" loading="lazy" title="Video" allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture; web-share" allowfullscreen></iframe></div>

Instructional for installing MediaMTX on Linux Virtual Server. Written for Rocky8

The github site for MediatMTX is at [https://github.com/bluenviron/mediamtx](https://github.com/bluenviron/mediamtx)

Download MediaMTX executable

Go to [https://github.com/bluenviron/mediamtx/releases](https://github.com/bluenviron/mediamtx/releases) and download the latest version of mediamtx for Linux amd64.tar.gz 

Unzip the file on to your local machine

Download the mediamtx\_create\_systemd\_firewall.sh script from folder below 

\*\*\* if you plan to do share out HLS streams via web browser then also download the letsecrypt\_ssl\_mediamtx.sh and the mediamtx\_renewLECerts.sh - We will get to that a bit later....

<div class="embed embed-tall"><iframe src="https://drive.google.com/embeddedfolderview?id=1PLdBZxlxxBTOdgzx6aLmdTQr2hfDfVgU#list" loading="lazy" title="Drive Folder, MEDIAMTX_SCRIPT"></iframe></div>

Launch local or virtual machine and get to the command line interface

Create a user named mediamtx

```bash
sudo useradd -m mediamtx
```

Set the password for the mediamtx user

```bash
sudo passwd mediamtx
```

Enter the password for mediamtx user

```bash
mediamtx
```

you will get this message;

“BAD PASSWORD: The password contains the user name in some form” 

it’s ok just paste mediamtx again.

You will know you did it right when you get this message in return;

“all authentication tokens updated successfully.”

By creating this user named mediamtx this also made a folder called mediamtx under the home folder. 

This will become important in a few more steps.

Make mediamtx user a 'sudo user'

```bash
sudo usermod -aG wheel mediamtx
```

Switch from the Root user to the mediamtx user

```bash
su - mediamtx
```

Now its time to install MediaMTX

Transfer the mediamtx.yml, mediamtx executable file and the MediaMTX Firewall config script to the mediamtx folder. I use filezilla. Use what you like.

Get to the mediamtx folder where the mediamtx installer is located.

```bash
cd /home/mediamtx
```

Queue up the MediaMTX install

```bash
sudo chmod +x mediamtx
```

Enter password if asked for MediaMTX user

```bash
mediamtx
```

Execute the MediatMTX insall 

```bash
./mediamtx
```

Output should look like this

![](/images/img-053.webp)

Type Control C to exit the MediaMTX Service

Create service to start on boot and configure firewall.

Queue Script

```bash
sudo chmod +x mediamtx_create_systemd_service_firewall.sh
```

Enter password if asked for MediaMTX user

```bash
mediamtx
```

Execute Script

```bash
./mediamtx_create_systemd_service_firewall.sh
```

Check Firewall 

```bash
sudo firewall-cmd --zone=public --list-ports
```

Settings should look like picture below.

![](/images/img-046.webp)

AT THIS POINT YOUR SERVER IS INTALLED

But we are going to go into the the yml file (pronounced "YAMAL") and add some security preferences. Do to that we need a text editor. I like NANO.

Now we are going install NANO.

Command to install NANO 

```bash
sudo yum install nano
```

Enter password if asked for MediaMTX user

```bash
mediamtx
```

At prompt for installing package entter "y" hit enter

A successful instalation will return the version installed and a "Complete !" message

![](/images/img-047.webp)

The reason we are going to install the following security preferences is because out of the box other than some firewall settings for the server anyone could point their video to the server if they had the ip address and the port number.  
We are going to add a username and password to be required to stream to keep someone from hijacking the video server.

First change director to the location of the yml file.

```bash
cd /usr/local/etc
```

Edit the file with nano

```bash
sudo nano mediamtx.yml
```

Adding a security with a username and password to the server

Now we are going to scroll down to the "authMethod: internal" section and edit the file

Adding a user name in the "user:" section - pay attention to a space after the colon.

Adding a password in the "pass:" section - pay attention to the space after the colon

Example Below.

After we are done we are going to whats called "Write Out" which saves the changes - hit control O

Next hit enter to save the changes.

Now hit control X to exit out of NANO

![](/images/img-052.webp)

After we are done we are going to whats called "Write Out" which saves the changes - hit control O

Next hit enter to save the changes.

Now hit control X to exit out of NANO

To get back to view the MediaMTX service copy and paste this command. It will bring up the current available services and show current activity.

```bash
sudo journalctl -fu mediamtx
```

Enter password if asked for MediaMTX user

```bash
mediamtx
```

This is what the service looks like. Current activity will stream at the bottom. Type control c to exit.

![](/images/img-054.webp)

Type control c to exit.

Restart the MediaMtx service to enforce file change

```bash
sudo systemctl restart mediamtx
```

Get back to view the MediaMTX service so we can monitor the service as we connect to it.

```bash
sudo journalctl -fu mediamtx
```

Now your server is set up to stream from ATAK clients through the UASTool and TAK-ICU plugins using RTSP.

You can use the ip address of your server or if you have set up an A record for DNS you could use a domain name.

Under Construction

How to add an SSL Certificate from LetsEncrypt

and use FFmpeg to send an HLS video stream to watch in a web browser using Rocky 8

<div class="embed"><iframe src="https://www.youtube-nocookie.com/embed/MLTFuojH-S4" loading="lazy" title="Video" allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture; web-share" allowfullscreen></iframe></div>

To use LetsEncrypt you must have a FQDN (Fully Qualified Domain Name) with an A record pointing to your server. So you need to get to your service provider whom ever that is GoDaddy as an example and make that change now. It can take up to 30 minutes for this to be active through out the internet.

Download the letsecrypt\_ssl\_mediamtx.sh and the mediamtx\_renewLECerts.sh - If you already did this at the beginning then go ahead and skip this.

<div class="embed embed-tall"><iframe src="https://drive.google.com/embeddedfolderview?id=1PLdBZxlxxBTOdgzx6aLmdTQr2hfDfVgU#list" loading="lazy" title="Drive Folder, MEDIAMTX_SCRIPT"></iframe></div>

Now we are going to install FFMPEG. This program is just going to run in the background and interact with commands from mediamtx.

Get to the command line and execute the following commands

```bash
dnf install dnf-plugins-core
```

```bash
dnf install epel-release
```

```bash
dnf config-manager --add-repo=https://negativo17.org/repos/epel-multimedia.repo
```

```bash
dnf config-manager --set-enabled powertools
```

```bash
dnf install ffmpeg
```

FFMPEG is installed and now we will install LetsEncrypt.

Transfer the letsecrypt\_ssl\_mediamtx.sh and the mediamtx\_renewLECerts.sh to the mediamtx folder. I use filezilla. Use what you like.

Get to the mediamtx folder where the mediamtx installer is located.

```bash
cd /home/mediamtx
```

Queue up the Letsencrypt script

```bash
sudo chmod +x letsencrypt_ssl_mediamtx.sh
```

Enter the password for mediamtx user

```bash
mediamtx
```

Execute the scripts

```bash
./letsencrypt_ssl_mediamtx.sh
```

There will be a series of prompts

1.  enter an email where LetsEncrypt can get a hold of you

2.  agree to terms of service - choose y

3.  sharing of email choose y or no

4.  Enter your domain name - example - videotest.taktical.net

5.  Enter certificate name - example - videotest.taktical.net (I usually have them match)

On completion you will get a return like this -

Successfully received certificate.

Certificate is saved at: /etc/letsencrypt/live/videotest.taktical.net/fullchain.pem

Key is saved at:         /etc/letsencrypt/live/videotest.taktical.net/privkey.pem

This certificate expires on 2024-06-29.

These files will be updated when the certificate renews.

Certbot has set up a scheduled task to automatically renew this certificate in the background.

We were unable to subscribe you the EFF mailing list because your e-mail address appears to be invalid. You can try again later by visiting https://act.eff.org.

Next the script will make a cronjob which will automatically renew this certificate.

We are now done with LetsEncrypt and we need to get to the yml file and make some edits using Nano. 

I have attached an example yml file in the google drive link above that can be downloaded and replaced on to your machine and you can edit that if you want instead of copy and pasting all of these things

Steps to do this would rename it from Example\_LetsEncrypt\_mediamtx.yml to mediamtx.yml and place it in the /usr/local/etc file. 

FileZilla will ask if you want to replace it and choose yes.

You can then nano that file and you would need to change the username, password (covered in the first section/original video) and then rename the pathway to your LetsEncrypt folder. Then save the changes and restart mediamtx.

You can watch this video, see what I edit do to make all this happen first. You can make a decision from there on how you want to roll. 

....here we go.

Change director to the location of the yml file.

```bash
cd /usr/local/etc
```

Edit the file with nano

```bash
sudo nano mediamtx.yml
```

Adding permissions for localhost viewing

Scroll down to the "authMethod: internal" section and edit the file

Adding in the actions of publish and read.

![](/images/img-048.webp)

Edit the Global settings for the RTSP server

Now we are going to scroll down to the "Global settings -> RTSP server" section and edit the file

We are going to add \[tcp\] to the protocol

![](/images/img-050.webp)

Edit the Global settings for the HLS server

Now we are going to scroll down to the "Global settings -> HLS server" section and edit the file

Enabling hlsEncrytion by adding "yes"

Adding the file path for the "hlsServerKey:" section - This will be the LetsEncrypt privkey.pem

Adding the file path for the "hlsServerCert:" section - This will be the LetsEncrypt fullchain.pem

Adding mpegts into the "hlsVariant"

![](/images/img-051.webp)

Edit the Path Settings by pasting in the following lines below #    source:  rtsp://my\_camera. 

Pay close attention to spaces. For example runOnReady for example is two spaces in from the line above. 

The line below it for runOnReadyRestart its also two spaces in. 

Example picture below.

![](/images/img-049.webp)

```bash
"~^live/(.+)$":
```

```bash
runOnReady: ffmpeg -i rtsp://localhost:8554/live/$G1 -c:v copy -map 0:0 -f rtsp rtsp://localhost:8554/hls/$G1
```

```bash
runOnReadyRestart: yes
```

After we are done we are going to whats called "Write Out" which saves the changes - hit control O

Next hit enter to save the changes.

Now hit control X to exit out of NANO

Now the videos can be viewed in a web browser by going to [https://yoururl:8888/hls/streamname](https://yoururnl.com:8888/hls/streamname) 

You will be prompted for username and password for your server which we went over in the first video.

The browser will save this so subsequent views will not require it.
