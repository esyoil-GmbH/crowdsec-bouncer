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
- there is currently not IPv6 support. While CrowdSec itself supports IPv6, we currently don't have IPv6 deployed on our infrastructure so there was no need to implement that.
- a captcha would be nice. Even though there is a rate-limit on the unban endpoint, it can theoretically be called via code before a crawl.


#### How's it working?
We only use the IP the request is coming from, for that we parse it (perhaps also any X-Forwarded-For-Headers). With the Local-API we check if there is a entry on the decisions-list for that IP. If there is one, we remove it via API. For this, we need to register a custom bouncer, since bouncers are the only allowed entity to remove entries from the decision list.

#### How to set this up?
Soon 🙃