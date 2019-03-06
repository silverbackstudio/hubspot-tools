#!/usr/bin/env node

const program = require('commander');
const readline = require('readline');
const _ = require('lodash');
const hubspot = require('./hubspot');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Console colors
const cReset = "\x1b[0m";
const FgRed = "\x1b[31m";
const FgGreen = "\x1b[32m";
const FgYellow = "\x1b[33m";

// HubSpot API limits
const MAX_PAGE_SIZE = 100;
const MAX_BATCH_SIZE = 1000;

// Command line options
program
  .version('0.1.0')
  .command('migrate <migrationFiles...>')
    .usage('node contacts migrate [options] <migrationFiles...>')
    .option('-l, --limit [limit]', 'Limit migration to the first N contacts', parseInt, 0)

    .action(function (migrationFiles, options) {
        
        /** 
         * Migrate all contact properties.
         * 
         * Run all contact migrations specified in migrationFiles param.
         * 
         * @param {string[]}    migrationFiles  The list of migration files configs
         * @param {Object}      options         The script runtime options
         * @param {number}      options.limit   The maximum amount of contacts to migrate
         */

        let migrationData = [];

        migrationFiles.forEach(migrationFile => {
            try {
                migrationData.push( require(migrationFile) );
            } catch (e) {
                console.error(FgRed + 'Migration file "%s" non exists or cannot be parsed: %s', migrationFile, e.message, cReset);
                return;
            }                
        });  

        console.log('Will apply migrations:\n');
        migrationData.forEach( mData => console.log( FgGreen + '-> %s' + cReset, mData.title) );
        console.log( `\nto ${FgYellow}%s${cReset} contacts.`, options.limit || 'ALL' );

        rl.question( `${FgYellow}Do you want to continue [yes/no]?${cReset} `, (answer) => {

            if ( 'yes' == answer ) {
                console.log('Appling migration:', migrationData.name );    
                migrationData.forEach(migrationData => migrate( migrationData, options ) );      
            }

            rl.close();
        });
        
    });

program.parse(process.argv)

/** 
 * Run migration based on migraton file specs.
 * 
 * @param {Object}      migration                The migration config object {@see migrations/example.js}
 * @param {number}      migration.title          The migration title/description
 * @param {function}    migration.transform      The function that shuold be applied reduce all contacts to a bulk contact update array
 * @param {Object}      migration.options        The HubSpot API endopint opotion to apply to each input request  
 */
const migrate = async (migration, options) => {
        
    limit = options.limit || 0;
    
    // Retrieve contacts from API
    var contacts = await getContacts(migration.options, limit);
    console.log('RETRIEVED %d contacts', contacts.length);

    // Ensure that the actual contact limit is preserved
    if ( limit ) {
        contacts = contacts.slice(0, limit);
    }
    console.log('ANALYZING %d contacts', contacts.length);

    //Perform the actual contact properties migration
    var modContacts = contacts.reduce(migration.transform, []);

    if ( modContacts.length < 1 ) {
        console.log('No Contact update needed, exiting early');
        process.exit(1);
    }

    //HubSpot APIs allow max 1000 contacts in batch update requests.
    let batches = _.chunk( modContacts, MAX_BATCH_SIZE );
    console.log('UPDATING %d contacts in %d batches (%d items each)', modContacts.length, batches.length, MAX_BATCH_SIZE);

    for (let i = 0; i < batches.length; i++) {
        
        console.log('UPDATING batch %d, size %d', i, batches[i].length );
        let response = hubspot.contacts.createOrUpdateBatch(batches[i]);
        
        response
            .then( () => console.log('UPDATED batch %d', i) )
            .catch( function (reason) {
                console.error('UNKNOWN ERROR on batch %d: ', i, reason.message);
            });            
    }
}

/** 
 * Retrieve contacts from HubSpot API.
 * 
 * @param {Object} hubspotOptions   The HubSpot API endopint opotion to apply to each input request
 * @param {number} limit            The maximum amount of contacts to retrieve
 *   
 * @see {@link https://developers.hubspot.com/docs/methods/contacts/get_contacts} for all the available contact fields
 */
const getContacts = async (hubspotOptions, limit) => {
    let records = [];
    limit = limit || 0;
    let vidOffset = hubspotOptions.vidOffset || 0;
    let response;

    if ( ! hubspotOptions.formSubmissionMode ) {
        hubspotOptions.formSubmissionMode = 'none';
    }

    do {
        
        hubspotOptions.count = limit ? Math.min( limit - records.length, MAX_PAGE_SIZE ) : MAX_PAGE_SIZE;
 
        if ( vidOffset )  {
            hubspotOptions.vidOffset = vidOffset;
        }

        console.log('REQUESTING %d contacts %d/%s, from VID %d', hubspotOptions.count, records.length, limit || 'INF', vidOffset);
        response = await hubspot.contacts.get( hubspotOptions );
        
        await records.push.apply(records, response.contacts);
        
        vidOffset = response['vid-offset'];

    } while( response['has-more'] &&  ( !limit || (records.length < limit ) ) );

      return records;
}