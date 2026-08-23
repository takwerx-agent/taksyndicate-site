---
layout: ../layouts/Docs.astro
title: "TAK Server"
description: "Standing up and operating a TAK Server, step by step."
---

# TAK-SERVER

Installation Instructions

<div class="embed"><iframe src="https://www.youtube-nocookie.com/embed/zZgb4KVKtF0" loading="lazy" title="Video" allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture; web-share" allowfullscreen></iframe></div>

Instructional for installing TAK-SERVER RPM on Linux Virtual Server. (Written for Rocky8)

Download TAK-SERVER,  Instructions, Scripts and Data Package Master Folder

Go to [www.tak.gov](http://www.tak.gov) and download Rocky8 version of TAK-Server onto your local machine

Go to [http://maps.takserver.us](http://maps.takserver.us) to the TAK\-SERVER folder or the resources page on this website or directly below and download the TAK SERVER SCRIPTS and the MASTER\_SERVER\_NAME\_FOLDER\_STRUCTURE onto your local machine.

.

\*\*modify Script - RL8.9\_tak5r69\_install.sh to match the TAK Server version and release number\*\*

\*\*current version I am using is 5.5 release 58. You can modify as necessary\*\*

\*\*you have to modify the script file name AND you must go into the script and ensure the rmp file matches\*\*

\*\*\*\*some virtual machines are not restarting in time when the script runs to promote the admin user, new instructions if that happens below\*\*\*\*

<div class="embed embed-tall"><iframe src="https://drive.google.com/embeddedfolderview?id=16sRkCCxSZss5EFTAbNWEVYlFVGHsGzrM#list" loading="lazy" title="Drive Folder, TAK-SERVER"></iframe></div>

Launch local or virtual machine and get to the command line interface

Create a new user named atak

```bash
sudo useradd -m atak
```

Set the password for the atak user

```bash
sudo passwd atak
```

Enter password for atak user

```bash
atakatak
```

you will get this message;

“BAD PASSWORD: The password contains the user name in some form” 

it’s ok just paste atakatak again.

You will know you did it right when you get this message in return;

“all authentication tokens updated successfully.”

By creating this user named atak this also made a folder called atak under the home folder. 

This will become important in a few more steps.

Make atak user ‘sudo user’

```bash
sudo usermod -aG wheel atak
```

Switch from the Root user to the ATAK user

```bash
su - atak
```

Copy scripts and TAK-SERVER RPM files into ATAK folder via FTP Client

Script \- takUserCreateCerts\_doNotRunAsRoot.sh

Script - createTakCerts.sh

Script - RL8.9\_tak5.5r58\_install.sh

Script - takserver\_createLECerts.sh

Script - takserver\_renewLECerts.sh

Script - promoteAdmin.sh

RPM Installer - takserver-5.5\-RELEASE58.noarch.rpm

Now its time to install the TAK-SERVER

Get to the atak folder where all the scrips and tak server rpm file are

```bash
cd /home/atak
```

Queue up the TAK-SERVER install

```bash
sudo chmod +x RL8.9_tak5.5r58_install.sh
```

Enter password if asked for atak user

```bash
atakatak
```

Execute the TAK-SERVER installation 

Edit the version and release number as neccessary

```bash
./RL8.9_tak5.5r58_install.sh
```

1st user prompt - will be for the atak user password for installing Java 17

2nd user prompt - install 1 package answer y

3rd User prompt - select java option choose - 1

```bash
atakatak
```

The next step will start configuring the certificates.

Enter the following with NO SPACES (you can put whatever you want - press enter after each entry)

STATE:

CITY:

ORG:

ORG UNIT:

4th User Prompt - give a name for the Certificate Authority, has to be at least five characters

5th User Prompt - answer 'y' to the "Do you want me to move files around" question, it's for the intermediate signing CA

The script will  restart TAK Server and give a 90 second countdown before it configures the intermediate-ca for use.

The script will restart the TAK Server again for 270 seconds to ensure the TAK Server is fully restarted prior to promoting the admin.pem certificate to the administrator role.

\*\*\*\* Sometimes this still is not enough time and the promotion of the admin cert may fail. If you try and access the server and your are forced to the webtak login page at port 8446 that means that the admin cert has not been promoted. Instructions below if this happens.

Enter password for atak user

```bash
atakatak
```

Now your TAK-SERVER is complete 

-   The Firewall was configured to allow TCP connections at port 8089;8443;8446

-   To login to your new TAK-Server instance you need to import the admin.p12 into your browser.

-   Another file you will need for building a datapackage for connection is the trust store-intermediate-ca.p12 file.

-   Move them both to you your local machine.

-   Firefox has been the easiest browser to work with in my experience.

-   To do this move browse to the root directory opt/tak/certs/files on the virtual machine and copy them to your to your local machine.

-   This script also made a copy of the admin cert and put it in the atak folder (the same folder you placed all the scripts and tak-server rpm file in)

-   In Firefox go to your settings and in the search bar type in Certificates

-   Click on View Certificates, then click on Your Certificates, click on Import and browse to wherever you stored the admin.p12 file then click OK.

-   You will notice Firefox will list the certificate by the ORG name you set up.

-   To get to your TAK-Server enter your ip address and port 8443; example https://ipaddresshere:8443

-   You will be prompted to choose your certificate - you only have to do this once.

If your run into the issue where you cant login into the admin portal and its forcing you to the webtak login page at port 8446 run the commands below.

Get to the atak folder where all the scripts are

```bash
cd /home/atak
```

Que up the promoteAdmin script

```bash
sudo chmod +x promoteAdmin.sh
```

Enter password for atak user if asked

```bash
atakatak
```

Execute script

```bash
sudo ./promoteAdmin.sh
```

You should get a return that looks like this if you are successful -

![](/images/img-044.webp)

Creating user accounts using the TAK-Server web interface follow along on the video

Creating DataPackage for Connection for a TAK-Server that is using an IP address only follow along with the video.

Using LetsEncrypt to allow the TAK-Server to use a public facing domain. 

Step 1 - Go to your domain host provider like godaddy.com etc. and add an A record to point to the IP addres of the TAK-Server

Go to the atak folder 

```bash
cd /home/atak
```

Que up the LetsEncrypt Script 

```bash
sudo chmod +x takserver_createLECerts.sh
```

Enter password for atak user if asked

```bash
atakatak
```

Execute script

```bash
sudo ./takserver_createLECerts.sh
```

There will be a series of prompts

1.  enter an email where LetsEncrypt can get a hold of you

2.  agree to terms of service - choose y

3.  sharing of email choose y or no

4.  Enter your domain name - example - tak1.mytakserver.com

5.  Enter certificate name - example - tak1.maytakserver.com (I usually have them match)

On completion you will get a return like this -

Successfully received certificate.

Certificate is saved at: /etc/letsencrypt/live/swat1.taktical.net/fullchain.pem

Key is saved at:         /etc/letsencrypt/live/swat1.taktical.net/privkey.pem

This certificate expires on 2024-06-29.

These files will be updated when the certificate renews.

Certbot has set up a scheduled task to automatically renew this certificate in the background.

We were unable to subscribe you the EFF mailing list because your e-mail address appears to be invalid. You can try again later by visiting https://act.eff.org.

Next the script will make a cronjob which will automatically renew this certificate.

Now that you have the LetsEncryt going you have 2 options for connecting an ATAK client to the TAK-Server.

Option 1 - Create DataPackage for Connection

For an ATAK client to be able to connect to the server using the LetsEncrypt authority you will follow the same steps as using an IP address but just use your web address inlace of an IP address.

The easiest way to get the client onto the server is to create a DataPackage (a zipped file) with the truststore-intermediate-ca.p12 file, a manifest and a preference file with the web address.

When you downloaded the MASTER\_SERVER\_NAME\_FOLDER\_STRUCTURE it came with a boiler plate profile preference file and a manifest you can modify to reflect this information.

Once the datapackage is created you can share that out with the user’s unique username and password you created using the TAK-Server GUI.

The end user will download the data package onto their device, use the import feature in ATAK, upon import ATAK will prompt for the username and password.

Option 2 - Manual cert enrolment

The second option is the ATAK client can add a connection manually and enroll for a certificate.

To do that share the web address of the server i.e. tak1.mytakserver.com and the username and password you created on the TakServer web GUI.

From ATAK the user can add the takserver connection using the domain address and then choose enroll for certificate and then at prompt enter the username and password combo you issued to them. 

I have included a pdf instructional for how to do this. You can share that with your end user.
