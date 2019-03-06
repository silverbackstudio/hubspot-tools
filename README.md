# HubSpot Script Toolbelt

A collection of command line tools for HubSpot CRM.

## Install

All the script run on NodeJS 10+. You can install node from [https://nodejs.org/it/download/]() or [https://nodejs.org/en/download/package-manager/]()

Install all required dependencies via NPM:

```bash
npm install
```

Create a copy of `config.example.json` in `config.json` and insert the HAPI KEY from your target HubSpot account.

## Contacts 

Work with HubSpot contacts 

### Properties migration and tranform

Apply a transform function to each, or some, contacts to create, edit, move properties's data.

#### Usage

Clone the template file `migrations\example.js` and edit the `transform` function to suit your needings.

Run the script pointing to your newly created file

```bash
node contacts migrate ./migrations/example.js --limit 100
```

You can specify multiple migrations at a time:

```bash
node contacts migrate ./migrations/example.js ./migrations/mymigration.js --limit 100
```

### Options
`-l, --limit [limit]`: Limit the migrations to the first [limit] contacts