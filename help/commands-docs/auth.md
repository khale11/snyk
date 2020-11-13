# snyk-auth(1) -- Authenticate Snyk CLI with a Snyk account

## SYNOPSIS

`snyk` `auth` \[<API_TOKEN>\] \[<OPTIONS>\]

## DESCRIPTION

Authenticate Snyk CLI with a Snyk account. Running `$ snyk auth` without an <API_TOKEN> will open a browser window and asks you to login with Snyk account and authorize. When inputting an <API_TOKEN>, it will be validated with Snyk API.

When running in a CI environment <API_TOKEN> is required.

## OPTIONS

- \[<API_TOKEN>\]:
  Your Snyk token. May be an user token or a service account.
  How to get your account token: https://support.snyk.io/hc/en-us/articles/360004037537-Authentication-for-third-party-tools

  How to use Service Accounts: https://support.snyk.io/hc/en-us/articles/360004037597-Service-accounts
