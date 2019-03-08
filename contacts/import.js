const update = require('./update');
const path = require('path');

// Console colors
const cReset = "\x1b[0m";
const FgRed = "\x1b[31m";

/** 
 * Import contact data to Hubspot from a JSON file.
 * 
 * Optionally apply a ETL on it.
 * 
 * @param {string}      jsonFile            The JSON input file
 * @param {string}      [mapFile]           The JS module that exports a function applied to each contact
 * @param {Object}      [options]           The HubSpot API endopint opotion to apply to each API request
 * @param {number}      [options.limit]     The maximum amount of contacts to process
 */
module.exports = async (jsonFile, mapFile, options) => {
    
    try {
        let jsonFilePath = path.resolve(process.cwd(), jsonFile);
        var contacts = require( jsonFilePath );
    } catch (e) {
        console.error(FgRed + 'Import Source file "%s" non exists or cannot be parsed: %s', jsonFilePath, e.message, cReset);
        return;
    }                      

    if ( mapFile ) {
        let mapFilePath = path.resolve(process.cwd(), mapFile);
        try {
            var reducer = require( mapFilePath );
        } catch (e) {
            console.error(FgRed + 'Import map file "%s" non exists or cannot be parsed: %s', mapFilePath, e.message, cReset);
            return;
        }                          

    }

    limit = options.limit || 0;
    
    // Retrieve contacts from API
    console.log('RETRIEVED %d contacts', contacts.length);

    // Ensure that the actual contact limit is preserved
    if ( limit ) {
        contacts = contacts.slice(0, limit);
    }
    console.log('ANALYZING %d contacts', contacts.length);

    //Perform the actual contact properties migration
    var modContacts = contacts.reduce(reducer, []);

    if ( modContacts.length > 0 ) {
        Promise.all( update.batch( modContacts ) )
            .then( () => console.log('All contacts UPDATED') )
            .catch( function (reason) {
                console.error('UNKNOWN batch update error:', reason.message);
            });
    } else {
        console.log('No Contact update needed, skipping');
    }

}