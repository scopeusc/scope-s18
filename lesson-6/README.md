
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

<img src="https://i.imgur.com/CPzZPLR.png">

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

When you are finished making your changes, save and close the file using CTRL-X, then Y, then ENTER.

#### Firewall

We'll also want to set up a very basic firewall. These might seem like steps that are roundabout to our final goal of deployment, but in reality if they aren't done at the beginning, and properly, they won't be done at all. Ubuntu comes with a very basic Firewall called UFW, or the Ultimate FireWall. It's very easy to set up, and is made for ease of use (as opposed to the underlying iptables rules, which at least I personally have always had a ton of issues getting to work as I intend). 

Different applications can register their profiles with UFW upon installation. These profiles allow UFW to manage these applications by name. OpenSSH, the service allowing us to connect to our server now, has a profile registered with UFW.

You can see this by typing:

`sudo ufw app list`

<img src="https://i.imgur.com/kgZehzR.png">

We need to make sure that the firewall allows SSH connections so that we can log back in next time. We can allow these connections by typing:

`sudo ufw allow OpenSSH`

Afterwards, we can enable the firewall by typing:

`sudo ufw enable`

Type "y" and press ENTER to proceed. You can see that SSH connections are still allowed by typing:

`sudo ufw status`

You can manually specify ports or services with `sudo ufw deny <portnum>` or `sudo ufw allow <portnum>`.

#### Environment Set Up

One of the first issues you'll run into when setting up your VPS is mirroring your environment - there are a lot of tools and packages that you've gotten so used to having on your machine that you forget they were not installed by default. 

If you have preferences for shell, aliases, and various other dot files, install them now yourself. 

To get started, I'd recommend installing some of the core utilities and essential build libraries through apt.

```
sudo apt-get update 
sudo apt-get upgrade -y
sudo apt-get dist-upgrade -y
sudo apt autoremove
sudo apt-get install build-essential git 
```

Also, if you plan on using a database, install mongo with:

```
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv EA312927
echo "deb http://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.2 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.2.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

Finally, we'll want to install Node and NPM. We'll use nvm for this, the node version manager, as it'll allow us to effortlessly switch node versions.

`curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.8/install.sh | bash`

To install the latest version of node, type

`source ~/.bashrc && nvm install node && nvm use node`

Now we can actually get to work with deploying our application!

#### Setting up an app

Now it's time to start deploying a specific app. We'll do it incrementally, starting with raw port access on a single process and then move to a process manager, analytics, and reverse proxies!

The first step is to clone your project. The standard is in `/var/www/` but it doesn't really matter. If you'd prefer to organize your folder hierarchy differently, feel free to do so. 

For this guide, I'll be using [RandomComic](https://github.com/jonluca/RandomComic) as the app I'll be deploying. Steps might be slightly different for your app, but as long as it's a node/express app it should be fairly similar.

First set up your folder hiearchy:

```
sudo mkdir /var/www
sudo chown -R `whoami` /var/www
cd /var/www
git clone https://github.com/jonluca/RandomComic
```
Note - if your repo is private, you'll need to generate ssh keys on your VPS and add them to GitHub! Instructions on how to do so are [here](https://help.github.com/articles/adding-a-new-ssh-key-to-your-github-account/)

If everything goes well, you can now enter the directory and set everything up.

*Note:* Good practice dictates to never push your `node_modules` folder - always add it to the gitignore, and reinstall when you reclone!

```
cd RandomComic
npm install
```

Before we run the app, we want to make sure it's publicly accessible - check your `bin/www`. Normally it's in the 8000s or 3000s. For our sample application, it's 8070

Open the port up to the outside world with `sudo ufw allow 8070`. Start the process with `node bin/www`.

Now, if you navigate to `<droplet ip>:8070` you should see your app running! 

<img src="https://i.imgur.com/6CIXCiw.jpg">

#### Making the app robust

The app is currently running naked on a port - this brings up a couple of issues. First, it's fairly difficult to scale - you can always upgrade your droplet, but if you receive too much traffic you'll pretty quickly hit the limit for what a single machine can handle, especially if it's not optimized properly. If it crashes right now, you're SOL.

You'll want to load balance or distribute your resources, but you can't as it is right now. 

This is where process managers and reverse proxies come into play. For our simple use cases, we'll use nginx and PM2. 

We'll start with process management - this'll handle any crashes and restart your app automatically. It'll also allow you to control your app more than if you simply background the node process or use screen. 

Install pm2 with `npm i -g pm2`, and then start your app with `pm2 start bin/www `. That's it!

<img src="https://i.imgur.com/YcjAdIP.png">

You can customize it a lot more - GitHub hooks for automatic updating, watching the working directory and autoreload, monitor, load balance, etc. 

Side note: As you may know, Node is single threaded. It's highly recommended that, for production apps, you start it in load balancer mode. This can be done with `pm2 start bin/www -i <num>`, where num is the number of processes. They'll be selected in a round robin fashion by pm2. For more information, check Further Reading below. 

#### Nginx

Nginx is an incredibly powerful webserver in it's own right - it allows you to create virtual hosts, change proxy settings, load balance, and much more. It is one of the most common webservers in the world, and for good reason. 

Right now, our app is on port `8070` - you wouldn't want users to navigate to a raw port to access the service. Of course, you could change it's port to 80 and have them navigate to the raw IP, but that's still not ideal - what if you want to serve more content?

We can use a reverse proxy to route our requests to the right process, and to distribute the traffic as we see fit.

Install nginx with 

`sudo apt-get install nginx`

This'll create the `/etc/nginx/` directory, which contains all the settings for nginx. 

First, delete the default config found at `/etc/nginx/sites-available/default`, and replace it with the one in this repo. Also make sure the permissions are correct with `sudo chmod 644 /etc/nginx/sites-available/default`.

There's a lot going on in this file, let's go over each part line by line.

The start is 

```
add_header X-XSS-Protection "1; mode=block";
add_header X-Content-Type-Options nosniff;
add_header X-Frame-Options SAMEORIGIN;
server_tokens off;
```
These are security directives - while our test app doesn't have a large attack surface, it is important to get in the habit of making your site as secure as possible. We also turn server_tokens off, which are the `X-Powered-Py: nginx <version number>` HTTP headers.

```
server {
    listen 80;

    root /var/www/html;
    index index.html index.htm;

    location ~ /.git/ {
        deny all;
    }
    ...
```

Next, we declare a server block that listens on port 80. Nginx will effectively "take over" this port, and offer an http server over it. Note, you can have multiple server blocks that all listen on port 80, if you'd like to make individual changes to each server. 

We add some precautionary, best practice measures - we disable fetching any git repositories, and set the root of the app to /var/www/html. 

```
    location ~* /(.*) {
        proxy_pass http://127.0.0.1:8070/$1$is_args$args;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
```
Next we get to the main route matching - this is a location block which uses regular expressions to match the url/suburl. We're telling it to grab anything from `<domain or ip>`/ onwards. We then use the capture group (.*) to match everything after document root (/).

Inside the location block, we use `proxy_pass` to pass on our request to a local process, with all the arguments and original suburl. We also set some headers so our express app knows it's been proxied. 

Finally - 

```
    location ~ /.well-known {
        allow all;
    }

    location / {
        try_files $uri $uri/ =404;
    }
    
    location ~* /(images|js|css|fonts|assets) {
        expires 15d;
    }
```

The well-known location will be for our ssl cert, which we'll set up in the next section. We also define a 404 page for not found files, and tell any folders that don't change often to have a cache directive. 

Once you've replaced the file with ours, type `sudo service nginx reload` - if you navigate to just your droplet ip, you should see the app!


#### Domain

You should now register a domain for your app. In this example, we'll use namecheap, but all common registrars will have a very similar process.

As a student you get a free domain from namecheap, so go ahead and register one there. We won't go through the process here, but it should be fairly self explanatory. 

The only thing you need to do once you've registered it is to change the name servers to `ns1.digitalocean.com`, `ns2.digitalocean.com` and `ns3.digitalocean.com`, seen below

<img src="https://i.imgur.com/vXpBZgi.png">

Now go to Digital Ocean, and go to Networking -> Domains

<img src="https://i.imgur.com/uzVxBS7.png">

Add a domain (without the http/www, so http://www.google.com/ becomes google.com), then add an A record for your droplet and domain.

<img src="https://i.imgur.com/Q9MsjFz.png">

A lot of domain verification is done through DNS, so I'd recommend you get acquainted with what each of the records mean. For instance, AAAA records are IPv6 addresses, MX records are mail records, TEXT are just text associated with the domain, and CNAME are aliases for subdomains (for instance, if you want www.yoursite.com to go to your droplet, you'd add a CNAME like below:

<img src="https://i.imgur.com/2tvWlwW.png">

Your DNS settings are now complete! You might have to wait a bit (up to 24 hours) for them to propagate, but in my experience it usually takes about 5 minutes. 

Now we need to make some slight adjustments to our nginx config to get our domain to work properly - right below line 7, where it declares the port, add `server_name yoururl.com www.yoururl.com;`


Finally, check that the config is valid with `nginx -t` and then reload it with `sudo service nginx reload`. 

When you go to your URL, you should see RandomComic (or your webapp) live and up!

#### SSL 

We're almost done - our last item of business is to set up a TLS certificate, so we can communicate with our server securely!

This has many added benefits, although one of the most important ones is the ability to use http2, a much more efficient http protocol!

We'll start by installing Certbot, Let's Encrypt's certificate management system and allow https traffic on our box.

```
sudo add-apt-repository ppa:certbot/certbot
sudo apt-get update
sudo apt-get install python-certbot-nginx
sudo ufw allow 'Nginx Full'
```

Now we want to go through the process of actually registering a certificate for our domain.

`sudo certbot --nginx -d example.com -d www.example.com`

Replace example.com with your domain, and then follow the directions in the terminal! When it asks you if you'd like to redirect, I'd recommend saying yes and only communicating over https, but your use case may vary!

And that's it! The certificate should automatically renew itself on your server with certbot.

If you run into any issues, I'd recommend reading [this guide](https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-16-04).

# Wrapping up

At this point, you set up a server with your own account, fortified and hardened it, and then deployed a web app. The field of web development and deployment changes constantly, though, and it takes a while to get used to it and feel like you have a good grasp on everything that's going on. 

Hopefully you enjoyed your time in Scope this semester, and you won't stop learning about web dev and devops. 

The first thing I believe everyone should read after this semester is [High Performance Browser Networking](hpbn.co/#toc), which gives an in depth look at optimizing your application for performance and speed. 

Good luck!

# Further Reading

[Scalability Lecture](https://www.youtube.com/watch?v=-W9F__D3oY4)

[System Design Primer](https://github.com/donnemartin/system-design-primer)

# Glossary

| Acronym/word | Definition |
| -------- | -------- |
| VPS, droplet | Virtual Private Server - Basically just a box hosted by some cloud provider |
| Cloud Provider | A company that rents out servers - biggest ones are AWS, Azure, DigitalOcean, and GCP |
| SSL/TLS | Secure Socket Layer (modern versions are actually Transport Layer Security) - encrypts all communication between the client and server. Not at application layer, so it is invisible to anything you build  |
| DNS | Domain Name System - resolves URLs to IPs. How a client/browser knows that your website actually goes to your server |
| SSH | Secure Shell - A remote terminal for your box. It's how you'll interact with your server. |
| GEP | [GitHub Education Pack](https://education.github.com/pack) - lots of free resources for CS students |
| LTS | Long Term Support - the version of distros/products that will receive guaranteed support/bug fixes for a certain amount of time (usually around 18 months) |
| RCE | Remote Code Execution - Code gets run that didn't originate from the machine. Usually an attacker compromising your system|
| nginx | Nginx, one of the most common web servers |
