import { db } from "..";
import { filter_option } from "../types/filterOption";
import { SignalResponseType } from "../types";

export class BaseFireStoreService<T> {
    _collection: string;

    static getEnvCollection = (collectionPath = "default") => {
        const environment = process.env.APP_ENV || "dev";
        return `infina/environments/${environment}/${collectionPath}`;
    };

    constructor(collection: string) {
        this._collection = collection;
    }

    /**
     * Create document to firestore
     * @param data input document
     * @returns
     */
    create = async (data: Partial<T>): Promise<SignalResponseType<FirebaseFirestore.WriteResult>> => {
        try {
            const newDate = new Date().getTime();
            const result = await db
                .collection(this._collection)
                .doc()
                .set({ ...data, created_at: newDate, updated_at: newDate });

            return { error: false, message: "created", data: result };
        } catch (error: any) {
            return { error: true, message: error.message };
        }
    };

    /**
     * Create or update document to firestore
     * @param data input document
     * @returns
     */
    createOrUpdate = async (
        conditions: filter_option[] = [],
        data: any
    ): Promise<SignalResponseType<FirebaseFirestore.WriteBatch | FirebaseFirestore.WriteResult>> => {
        try {
            // begin a new query pipline with db's collection reference connect
            let resultPromisePipeline:
                | FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>
                | FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = db.collection(this._collection);

            // add conditions to the pipeline sequency
            conditions.forEach(
                (condition) =>
                    (resultPromisePipeline = resultPromisePipeline.where(
                        condition.field,
                        condition.expression,
                        condition.value
                    ))
            );

            // get first found doc to determine perform create or update
            let query = await resultPromisePipeline.limit(1).get();
            const newDate = new Date().getTime();
            let result;

            const doc = query.docs[0];
            // if document existed then delete else set created_at to document
            if (doc) {
                // define batch to use update document with transaction
                let batch = db.batch();
                // set old created at and updated at
                data["created_at"] = doc.data()?.created_at || newDate;
                data["updated_at"] = newDate;
                batch.delete(doc.ref);

                // create new document
                result = batch.create(doc.ref, data);

                // committed transaction
                await batch.commit();
            } else {
                result = await db
                    .collection(this._collection)
                    .doc()
                    .set({ ...data, created_at: newDate, updated_at: newDate });
            }

            return { error: false, message: "created", data: result };
        } catch (error: any) {
            return { error: true, message: error.message };
        }
    };

    /**
     *  Update document to firestore with conditions
     * @param conditions
     * @param data update data
     * @returns
     */
    update = async (
        conditions: filter_option[] = [],
        data: any
    ): Promise<SignalResponseType<FirebaseFirestore.WriteResult>> => {
        try {
            // define batch to use update document with transaction
            let batch = db.batch();

            // begin a new query pipline with db's collection reference connect
            let resultPromisePipeline:
                | FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>
                | FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = db.collection(this._collection);

            // add conditions to the pipeline sequency
            conditions.forEach(
                (condition) =>
                    (resultPromisePipeline = resultPromisePipeline.where(
                        condition.field,
                        condition.expression,
                        condition.value
                    ))
            );

            // stating to update seperated document by it's ref
            let updatedDocsCount = 0;

            await resultPromisePipeline.get().then((snapshot) => {
                snapshot.forEach((doc) => {
                    updatedDocsCount += 1;
                    batch.update(doc.ref, { ...data, updated_at: new Date().getTime() });
                });
            });

            // committed to update all found documents
            await batch.commit();

            return { error: false, message: `${updatedDocsCount} updated succeed` };
        } catch (error: any) {
            return { error: true, message: error.message };
        }
    };

    /**
     * Find documents with conditions
     * @param conditions
     * @returns
     */
    find = async (conditions: filter_option[] = []): Promise<SignalResponseType<Array<Partial<T>>>> => {
        try {
            // begin a new query pipline with db's collection reference connect
            let resultPromisePipeline:
                | FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>
                | FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = db.collection(this._collection);

            // add conditions to the pipeline sequency
            conditions.forEach((condition) => {
                resultPromisePipeline = resultPromisePipeline.where(
                    condition.field,
                    condition.expression,
                    condition.value
                );
            });

            const results = await resultPromisePipeline.get().then((snapshot) => {
                const docs: Array<Partial<T>> = [];
                snapshot.forEach((doc) => {
                    const data = doc.data() as Partial<T>;
                    docs.push(data);
                });

                return docs;
            });

            return { error: false, message: "found", data: results };
        } catch (error: any) {
            return { error: true, message: error.message };
        }
    };

    /**
     * Delete documents with conditions
     * @param conditions
     * @returns
     */
    delete = async (conditions: filter_option[] = []) => {
        try {
            // define batch to use update document with transaction
            let batch = db.batch();

            // begin a new query pipline with db's collection reference connect
            let resultPromisePipeline:
                | FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>
                | FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = db.collection(this._collection);

            // add conditions to the pipeline sequency
            conditions.forEach(
                (condition) =>
                    (resultPromisePipeline = resultPromisePipeline.where(
                        condition.field,
                        condition.expression,
                        condition.value
                    ))
            );

            // stating to delete seperated document by it's ref
            let deletedDocsCount = 0;

            await resultPromisePipeline.get().then((snapshot) => {
                snapshot.forEach((doc) => {
                    deletedDocsCount += 1;
                    batch.delete(doc.ref);
                });
            });

            // committed to delete all found documents
            await batch.commit();

            return { error: false, message: `${deletedDocsCount} deleted succeed` };
        } catch (error: any) {
            return { error: true, message: error.message };
        }
    };
}
