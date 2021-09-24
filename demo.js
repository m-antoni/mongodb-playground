const { MongoClient } = require('mongodb');
require('dotenv').config();

async function main(){
    /**
     * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
     * See https://docs.mongodb.com/ecosystem/drivers/node/ for more details
     * Blog post https://www.mongodb.com/developer/quickstart/node-crud-tutorial/
     */
    const uri = process.env.MONGO_URI;
    
    const client = new MongoClient(uri);

    try {
        
        // Connect to the MongoDB cluster
        await client.connect();

        // Make the appropriate DB calls
        // await  listDatabases(client);

        // insertOne
        // await createListing(client, {
        //     name: 'Lovely loft',
        //     summary: 'A charming loft in paris',
        //     bedrooms: 1,
        //     bathrooms: 1
        // })

        // insertMany
        // await createMultipleListings(client, [
        //     {
        //         name: "Infinite Views",
        //         summary: "Modern home with infinite views from the infinity pool",
        //         property_type: "House",
        //         bedrooms: 5,
        //         bathrooms: 4.5,
        //         beds: 5
        //     },
        //     {
        //         name: "Private room in London",
        //         property_type: "Apartment",
        //         bedrooms: 1,
        //         bathroom: 1
        //     },
        //     {
        //         name: "Beautiful Beach House",
        //         summary: "Enjoy relaxed beach living in this house with a private beach",
        //         bedrooms: 4,
        //         bathrooms: 2.5,
        //         beds: 7,
        //         last_review: new Date()
        //     }
        // ]);

        // findOne
        // await findOneListingByName(client, "Private room in london");


        // find
        // await findListingsWithMinimumBedroomsBathroomsAndMostRecentReviews(client, {
        //     minimumNumberOfBedrooms: 4,
        //     minimumNumberOfBathrooms: 2,
        //     maximumNumberOfResults: 5
        // })


        // updateOne
        // await updateListingByName(client, "Infinite Views", { bedrooms: 6, beds: 7 });

        // updated with upsert
        // await upsertListingByName(client, 'Cozy Cottage', { name: 'Cozy Cottage', bedrooms: 2, bathrooms: 2 });


        // updateMany
        // await updateAllListingsToHaveAPropertyType(client);

        
        // deleteOne
        // await deleteListingByName(client, 'Cozy Cottage');

        //deleteMany
        await deleteListingsScrapedBeforeDate(client, new Date("2019-02-15"))

    } catch (error) {
        console.error(error);
    } finally {
        await client.close();
    }
     
}


main().catch(console.error);

async function deleteListingsScrapedBeforeDate(client, date){
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").deleteMany({ "last_scraped": { $lt: date } });
    console.log(`${result.deletedCount} document(s) was/were deleted.`);
}

async function deleteListingByName(client, nameOfListing){
    const result = await client.db('sample_airbnb').collection('listingsAndReviews').deleteOne({ name: nameOfListing });

    console.log(`${result.deletedCount} document(s) was/were deleted`);
}

async function updateAllListingsToHaveAPropertyType(client){
    const result = await client.db('sample_airbnb').collection('listingsAndReviews')
                            .updateMany({ property_type: { $exists: false } }, { $set: { property_type: "Unknown" } });
    
    console.log(`${result.matchedCount} document(s) matched the query criteria`);
    console.log(`${result.modifiedCount} docuemnt(s) was/were updated`);
}


async function upsertListingByName(client, nameOfListing, updatedListing) {
    const result = await client.db("sample_airbnb").collection("listingsAndReviews")
                        .updateOne({ name: nameOfListing },
                                   { $set: updatedListing },
                                   { upsert: true });

    console.log(`${result.matchedCount} document(s) matched the query criteria.`);

    if (result.upsertedCount > 0) {
        console.log(`One document was inserted with the id ${result.upsertedId._id}`);
    } else {
        console.log(`${result.modifiedCount} document(s) was/were updated.`);
    }
}

async function updateListingByName(client, nameOfListing, updatedListing){
    const result = await client.db('sample_airbnb').collection('listingsAndReviews').updateOne({ name: nameOfListing }, { $set: updatedListing })

    console.log(`${result.matchedCount} document(s) matched the query criteria`);
    console.log(`${result.modifiedCount} document(s) was/were updated.`);
}


async function findListingsWithMinimumBedroomsBathroomsAndMostRecentReviews(client, { 
    minimumNumberOfBedrooms = 0,
    minimumNumberOfBathrooms = 0,
    maximumNumberOfResults = Number.MAX_SAFE_INTEGER
} = {} ){
    const cursor = client.db("sample_airbnb").collection("listingsAndReviews").find(
        {
            bedrooms: { $gte: minimumNumberOfBedrooms },
            bathrooms: { $gte: minimumNumberOfBathrooms }
        }
    ).sort({ last_review: -1 }).limit(maximumNumberOfResults);

    const results = await cursor.toArray(); 

    if (results.length > 0) {
        console.log(`Found listing(s) with at least ${minimumNumberOfBedrooms} bedrooms and ${minimumNumberOfBathrooms} bathrooms:`);
        results.forEach((result, i) => {
            date = new Date(result.last_review).toDateString();
            console.log();
            console.log(`${i + 1}. name: ${result.name}`);
            console.log(`   _id: ${result._id}`);
            console.log(`   bedrooms: ${result.bedrooms}`);
            console.log(`   bathrooms: ${result.bathrooms}`);
            console.log(`   most recent review date: ${new Date(result.last_review).toDateString()}`);
        });
    } else {
        console.log(`No listings found with at least ${minimumNumberOfBedrooms} bedrooms and ${minimumNumberOfBathrooms} bathrooms`);
    }
}

async function findOneListingByName(client, nameOfListing){
    const result = await client.db('sample_airbnb').collection('listingsAndReviews').findOne({ name: nameOfListing });

    if(result){
        console.log(`Found a listing in the collection with the name ${nameOfListing}`);
        console.log(result);
    }else{
        console.log(`No listings found with the name ${nameOfListing}`);
    }
}


async function createMultipleListings(client, newListing){
    const result = await client.db('sample_airbnb').collection('listingsAndReviews').insertMany(newListing);

    console.log(`${result.insertedCount} new listings created with the following id(s)`);
    console.log(result.insertedIds);
}


async function createListing (client, newListing){
    const result = await client.db('sample_airbnb').collection('listingsAndReviews').insertOne(newListing);

    console.log(`New listing created with the following id: ${result.insertedId}`);
}


async function listDatabases(client){
    databaseList = await client.db().admin().listDatabases();

    console.log("Databases:");
    databaseList.databases.forEach(db => console.log(` - ${db.name}`));
}