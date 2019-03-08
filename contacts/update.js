const hubspot = require('../hubspot/client');
const hubConstants = require('../hubspot/constants');
const _ = require('lodash');

/** 
 * Retrieve contacts from HubSpot API.
 * 
 * @param {Obejct[]} modContacts   All the contacts objects to update   
 */
exports.batch = (modContacts) => {
    //HubSpot APIs allow max 1000 contacts in batch update requests.
    let batches = _.chunk( modContacts, hubConstants.MAX_BATCH_SIZE );
    console.log('UPDATING %d contacts in %d batches (%d items each)', modContacts.length, batches.length, hubConstants.MAX_BATCH_SIZE);

    return batches.map((batch, i) => {
        console.log('UPDATING batch %d, size %d', i, batch.length );

        let response = hubspot.contacts.createOrUpdateBatch(batch);
        response
            .then ( () => { console.log('UPDATED batch %d', i) } )
            .catch( (reason) => { console.error('UNKNOWN ERROR on batch %d: ', i, reason.message) } );

        return response;
    });
}