
# Deployment 

Moving from your development environment to production can often be a frustrating and difficult experience. There are some simple, one click deployment solutions (like Heroku or Google Cloud Engine), but we want to give a more comprehensive view of what exactly is needed to maintain a VPS (Virtual Private Server).

## Overview

Before we begin, make sure you've got the [GitHub Education Pack](https://education.github.com/pack) - A lot of what we'll be doing will require the free resources provided by them. 

A bird's eye view of what we'll be covering is:

* Renting a VPS (Digital Ocean)
* Registering a domain
* Setting up DNS
* SSH Keys & Authentication
* Reverse Proxies
* Process Managers
* SSL Certificates & Let's Encrypt

This lesson will involve quite the breadth of material, so I'd recommend getting at least a little acquainted with basic networking - [High Performance Browser Networking](https://hpbn.co/#toc) is an amazing free resource.


## Getting Started

Note: See bottom for glossary

### VPS

AWS is the largest and most fully featured cloud hosting provider currently out available. It is sligtly harder to get started with, though, so we'll be using DigitalOcean. They provide a much simpler interface - most of what we'll be doing will be true regardless of hosting provider, though. 

If you want more flexibility and power in the future, though, Scope recommends using AWS. The GEP gives you $150 in credit. 

To start, go to DigitalOcean.com and create an account (use one of our referrals if you want 😀), and make sure you include the promo code from GEP, as that'll give you $50 in credit.

Now, spin up an Ubuntu x64 16.04.3 droplet (LTS as of this writing) at $5/month , like below.

<img src="https://i.imgur.com/wKqxaOq.png">

You also have the option to do a "One Click App" that has a lot of common stacks available - we'll be doing this manually, just so you get a good feel on how to do it on your own. 

Your options should be as follows:

* *Distribution*: Ubuntu 16.04.3
* *Size*: Standard, $5/month
* *Data Center Region*: Either SF or NY (SF is a newer data center though, with newer hardware ¯\\_(ツ)_/¯) - note: keep latency in mind! Your latency will be significantly higher when you're in Europe if you choose the SF one, and vice versa if you're in Asia. If you plan on mostly being west coast, we recommend SF 1 or 2
* *Additional Options*: Only check Monitoring
* *SSH Keys*: Add your SSH key. If you're on macOS, type `pbcopy < ~/.ssh/id_rsa.pub` and paste the outputs into new SSH key. If you don't yet have an SSH key, type `ssh-keygen` and hit enter on the all the default options. Then copy the SSH key using the command above.
* *Finalize and Create*: 1 droplet, and name it whatever you'd like
* Click create, and wait for it to spin up

Congratulations! You now have your own VPS! 

### Configuring the VPS

Note: Parts of this guide were adapted from DigitalOceans [Server Setup Guide](https://www.digitalocean.com/community/tutorials/initial-server-setup-with-ubuntu-16-04).


To log into your server, you will need to know your server's public IP address. You will also need the password or, if you installed an SSH key for authentication, the private key for the "root" user's account. If you set up your SSH key correctly in the previous step, you should be able to just type the following to log in.

`ssh root@your_server_ip`

Complete the login process by accepting the warning about host authenticity, if it appears, then providing your root authentication (password or private key). If it is your first time logging into the server with a password, you will also be prompted to change the root password.

Please note that you're running as root right now - any processes you start will have full system privileges, which is a fairly large security concern! If your server is unsecured or an attacker manages to get RCE, it'll run as root by default. 

#### Creating A New User

Once you are logged in as root, we're prepared to add the new user account that we will use to log in from now on. This example creates a new user called "jonluca", but you should replace it with a username that you like:

```
adduser jonluca
usermod -aG sudo jonluca
```

You will be asked a few questions, starting with the account password.

Enter a strong password and, optionally, fill in any of the additional information if you would like. This is not required and you can just hit `ENTER` in any field you wish to skip.

Now we'll want to add the SSH key from earlier to your new user.

Switch to your new user with `su - jonluca`

Then you'll want to set SSH up with

```
mkdir ~/.ssh
chmod 700 ~/.ssh
cd ~/.ssh
sudo cp /root/.ssh/authorized_keys .
sudo rm /root/.ssh/authorized_keys
sudo chown `whoami` authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

Let's go over what this is doing - it creates the ssh directory, and sets the correct permissions. Then we enter it, copy the ssh key we originally set up for root and delete it for root, then take ownership of the file. Finally, we change the permissions of the actual authorized keys file.

You should now be able to SSH into your box with `user@<server ip>`.

Now that your new user can use SSH keys to log in, you can increase your server's security by disabling password-only authentication. Doing so will restrict SSH access to your server to public key authentication only. That is, the only way to log in to your server (aside from the console) is to possess the private key that pairs with the public key that was installed.

As root or your new sudo user, open the SSH daemon configuration:

`sudo nano /etc/ssh/sshd_config`

Find the line that specifies PasswordAuthentication, uncomment it by deleting the preceding #, then change its value to "no". It should look like this after you have made the change:

`PasswordAuthentication no`

Here are two other settings that are important for key-only authentication and are set by default. If you haven't modified this file before, you do not need to change these settings:

```
PubkeyAuthentication yes
ChallengeResponseAuthentication no
```
When you are finished making your changes, save and close the file using CTRL-X, then Y, then ENTER.

#### Environment Set Up

One of the first issues you'll run into when setting up your VPS is mirroring your environment - there are a lot of tools and packages that you've gotten so used to having on your machine that you forget they were not installed by default. 

If you have preferences for shell, aliases, and various other dot files, install them now yourself. 

To get started, I'd recommend installing some of the core utilities and essential build libraries through apt.

`sudo apt-get update && sudo apt-get install build-essential git `

Also, install mongo with:

```
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv EA312927
echo "deb http://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.2 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.2.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

# Glossary

| Acronym | Definition |
| -------- | -------- |
| VPS | Virtual Private Server - Basically just a box hosted by some cloud provider |
| Cloud Provider | A company that rents out servers - biggest ones are AWS, Azure, DigitalOcean, and GCP |
| SSL/TLS | Secure Socket Layer (modern versions are actually Transport Layer Security) - encrypts all communication between the client and server. Not at application layer, so it is invisible to anything you build  |
| DNS | Domain Name System - resolves URLs to IPs. How a client/browser knows that your website actually goes to your server |
| SSH | Secure Shell - A remote terminal for your box. It's how you'll interact with your server. |
| GEP | [GitHub Education Pack](https://education.github.com/pack) - lots of free resources for CS students |
| LTS | Long Term Support - the version of distros/products that will receive guaranteed support/bug fixes for a certain amount of time (usually around 18 months) |
| RCE | Remote Code Execution - Code gets run that didn't originate from the machine. Usually an attacker compromising your system|
