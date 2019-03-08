#!/usr/bin/env node

const program = require('commander');
const readline = require('readline');

const migrate = require('./migrate');
const _import = require('./import');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Console colors
const cReset = "\x1b[0m";
const FgRed = "\x1b[31m";
const FgGreen = "\x1b[32m";
const FgYellow = "\x1b[33m";

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

        let migrationsData = [];

        migrationFiles.forEach(migrationFile => {
            try {
                migrationsData.push( require(migrationFile) );
            } catch (e) {
                console.error(FgRed + 'Migration file "%s" non exists or cannot be parsed: %s', migrationFile, e.message, cReset);
                return;
            }                
        });  

        console.log('Will apply migrations:\n');
        migrationsData.forEach( mData => console.log( FgGreen + '-> %s' + cReset, mData.title) );
        console.log( `\nto ${FgYellow}%s${cReset} contacts.`, options.limit || 'ALL' );

        rl.question( `${FgYellow}Do you want to continue [yes/no]?${cReset} `, (answer) => {

            if ( 'yes' == answer ) {
                migrationsData.forEach(migrationData => migrate( migrationData, options ) );      
            }

            rl.close();
        });
        
    });

program
    .command('import <jsonFile> [parserFile]')
        .usage('node contacts import [options] <jsonFile> [mapFile]')
        .option('-l, --limit [limit]', 'Limit migration to the first N contacts', parseInt, 0)
        .action(function (jsonFile, mapFile, options) {
            
            /** 
             * Import contacts.
             * 
             * Create or update contacts and it's properties
             * 
             * @param {string}      jsonFile        The import file JSON
             * @param {string}      mapFile         The path of a import file mapper
             * @param {Object}      options         The script runtime options
             * @param {number}      options.limit   The maximum amount of contacts to process
             */

            console.log('Will import:\n');
            console.log( FgGreen + '-> %s' + cReset, jsonFile);

            if ( mapFile ) {
                console.log( 'with mapfile %s', mapFile );
            }

            rl.question( `${FgYellow}Do you want to continue [yes/no]?${cReset} `, (answer) => {

                if ( 'yes' == answer ) {
                    _import( jsonFile, mapFile, options);      
                }

                rl.close();
            });
            
        });    

program.parse(process.argv)
