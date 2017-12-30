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
* *SSH Keys*: Add your SSH key. If you're on macOS, type `pbcopy < ~/.ssh/id_rsa.pub` and paste the outputs into new SSH key
* *Finalize and Create*: 1 droplet, and name it whatever you'd like
* Click create, and wait for it to spin up

Congratulations! You now have your own VPS! 

### 


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
