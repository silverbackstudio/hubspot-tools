/**
 * The migration title
 */
exports.title = 'Example Migration';

/**
 * The options for HubSpot API request
 * @see {@link https://developers.hubspot.com/docs/methods/contacts/get_contacts} for all the available options
 */
exports.options = {
    property: ['stage_del_lead', 'lifecyclestage'],
    formSubmissionMode: 'none',
    propertyMode: 'value_and_history'
}

/** 
 * This function will be passed as reducer of the contacts array.
 * 
 * @param {Object[]}    contactsUpdates                         The array contaning all the contact
 * @param {number}      contactUpdates[].vid                    The HubSpot contact VID
 * @param {Object[]}    contactUpdates[].properties             The properties that should be updated for this contact
 * @param {string}      contactUpdates[].properties[].property  The Hubspot Property internal name
 * @param {string}      contactUpdates[].properties[].value     The Hubspot Property value to set
 * @see {@link https://developers.hubspot.com/docs/methods/contacts/batch_create_or_update} to understand the batch update request structure
 * 
 * @param {Object}      contact                                 The contact source object
 * @param {Object}      contact.properties                      The object containing all the requested contact properties
 * @param {string}      contact.properties[].value              The property value
 * @see {@link https://developers.hubspot.com/docs/methods/contacts/get_contacts} for all the available contact fields
 *  
 * @return {Object[]}   The modified `contactUpdates` passed to the next iteration.
 */

exports.transform = (contactsUpdates, contact) => {

    /**
     * WARNING:
     * If a contact property has no value in HubSpot, the propery will not show up in the API response.
     * You should always check for the propery beeing defined before checking it's value
     */

    if ( ! contact.properties.lifecyclestage || ("customer" != contact.properties.lifecyclestage.value) ) {

        /**
         * If properties of this contact must be updated, push an object to the `contactsUpdated` array.
         */

        contactsUpdates.push({
            vid: contact.vid,
            properties: [
                // {
                //     property: "propertyname",
                //     value: "propertyvalue"
                // }
            ]
        });
    }

    // Remember to always output the updates array
    return contactsUpdates;
}
