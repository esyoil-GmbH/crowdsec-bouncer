#### CrowdSec Custom Remediation
<p align="center">
  <img src="https://github.com/crowdsecurity/crowdsec-docs/blob/main/crowdsec-docs/static/img/crowdsec_logo.png" alt="CrowdSec" title="CrowdSec" width="400" height="260"/>
</p>


##### What's this? (Scope of the project, what it's supposed to do)
- show a custom page with some background information on why you were blocked
- give the option for a user to unban himself
- add a rate-limit so bad actors cannot unban themselves over and over
- communicate with the CrowdSec Local-API (LAPI) to remove entries from the decisions-list


##### What's missing?
- there currently is IPv6 support. While CrowdSec itself supports IPv6, we currently don't have IPv6 deployed on our infrastructure so there was no need to implement that.
- a captcha would be nice. Even though there is a rate-limit on the unban endpoint, it can theoretically be called via code before a crawl.


#### How's it working?
We only use the IP the request is coming from, for that we parse it (perhaps also any X-Forwarded-For-Headers). With the Local-API we check if there is a entry on the decisions-list for that IP. If there is one, we remove it via API. For this, we need to register a custom bouncer, since bouncers are the only allowed entity to remove entries from the decision list.

#### How to set this up?
We are using the openresty-bouncer and modified the script to redirect to a custom domain instead of returning a 403. The sub-domain has a custom webroot so we can show the `packages/frontend/index.html`.

##### Throttle limit (rate limiting)
If you want to limit how often users can unban themselves, you can tweak the `THROTTLE_TTL` time, which is 1800 seconds in the example (so 30 minutes).
That means that the IP can only unban itself every 30 minutes once.

##### Get credentials for the LAPI
1. run `sudo cscli bouncers add <some-name>` to generate a new API-Key. Save this key in your .env under `LAPI_KEY`. The `LAPI_HOST` is the IP of the server
2. run `sudo cscli machines add <some-other-name>` to generate a new machine, which will be needed to remove entries from the decision list.
3. save the name you entered under `MASCHINE_ID` and the key under `MASCHINE_PASSWORD`.

##### Build from source

1. clone this repository
2. build the docker-image: `docker build -t custom-bouncer-backend:latest .`
3. edit the .env.example and move it to .env
4. start the docker-container `docker run --name cs-bouncer-be -d -p 3000:3000 --env-file ./.env   custom-bouncer-backend:latest`

to deploy the frontend, modify and copy the `packages/frontend/index.html` to the webroot and configure the bouncer to redirect there instead of returning a status-code.