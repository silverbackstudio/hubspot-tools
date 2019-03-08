const getContacts = require('./get');
const update = require('./update');

/** 
 * Run migration based on migraton file specs.
 * 
 * @param {Object}      migration                The migration config object {@see migrations/example.js}
 * @param {number}      migration.title          The migration title/description
 * @param {function}    migration.transform      The function that shuold be applied reduce all contacts to a bulk contact update array
 * @param {Object}      migration.options        The HubSpot API endopint opotion to apply to each input request  
 */
module.exports = async (migration, options) => {
        
    limit = options.limit || 0;
    
    // Retrieve contacts from API
    var contacts = await getContacts.all(migration.options, limit);
    console.log('RETRIEVED %d contacts', contacts.length);

    // Ensure that the actual contact limit is preserved
    if ( limit ) {
        contacts = contacts.slice(0, limit);
    }
    console.log('ANALYZING %d contacts', contacts.length);

    //Perform the actual contact properties migration
    var modContacts = contacts.reduce(migration.transform, []);

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