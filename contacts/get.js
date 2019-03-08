const hubspot = require('../hubspot/client');
const hubConstants = require('../hubspot/constants');

/**
 * A function that performs the actual contact GET query and returns the raw data
 * @name requestContacts
 * @function
 * @param {String} hubspotOptions The HubSpot API endopint opotion to apply to the API request
*/

/** 
 * Browse trough the HubSpot pagination system
 * 
 * @param {requestContacts} requestContacts  The function that performs the actual query and returns raw contacts
 * @param {Object}          hubspotOptions   The HubSpot API endopint opotion to apply to each input request
 * @param {number}          limit            The maximum amount of contacts to retrieve
 *   
 * @see {@link https://developers.hubspot.com/docs/methods/contacts/get_contacts} for all the available contact fields
 */
const browse = async (requestContacts, hubspotOptions = {}, limit = 0) => {
    let response;
    let records = [];
    let vidOffset = hubspotOptions.vidOffset || 0;

    do {

        hubspotOptions.count = limit ? Math.min( limit - records.length, hubConstants.MAX_PAGE_SIZE ) : hubConstants.MAX_PAGE_SIZE;
 
        if ( vidOffset )  {
            hubspotOptions.vidOffset = vidOffset;
        }

        console.log('REQUESTING %d contacts %d/%s, from VID %d', hubspotOptions.count, records.length, limit || 'INF', vidOffset);
        response = await requestContacts( hubspotOptions );
            
        await records.push.apply(records, response.contacts);

        vidOffset = response['vid-offset'];

    } while( response['has-more'] &&  ( !limit || (records.length < limit ) ) );

    return records;
}

/** 
 * Retrieve contacts from HubSpot API.
 * 
 * @param {Object} hubspotOptions   The HubSpot API endopint opotion to apply to each request
 * @param {number} limit            The maximum amount of contacts to retrieve
 *   
 * @see {@link https://developers.hubspot.com/docs/methods/contacts/get_contacts} for all the available contact fields
 */
exports.all = async (hubspotOptions, limit) => {

    if ( ! hubspotOptions.formSubmissionMode ) {
        hubspotOptions.formSubmissionMode = 'none';
    }

    return browse( (pageHubspotOptions) => hubspot.contacts.get( pageHubspotOptions ), hubspotOptions, limit );
}

/** 
 * Retrieve contacts from an email list.
 * 
 * @param {string[]} emails             The emails to get
 * @param {Object}   hubspotOptions     The HubSpot API endopint opotion to apply to each request
 * @param {number}   limit              The maximum amount of contacts to retrieve
 *   
 * @see {@link https://developers.hubspot.com/docs/methods/contacts/get_contacts} for all the available contact fields
 */
exports.byEmails = async (emails, hubspotOptions, limit) => {

    if ( ! hubspotOptions.formSubmissionMode ) {
        hubspotOptions.formSubmissionMode = 'none';
    }

    return browse( (pageHubspotOptions) => {

        return hubspot._request({
            method: 'GET',
            path: '/contacts/v1/contact/emails/batch',
            qs: { email: emails, ...pageHubspotOptions },
            qsStringifyOptions: { indices: false },
        });        

    }, hubspotOptions, limit );
}

