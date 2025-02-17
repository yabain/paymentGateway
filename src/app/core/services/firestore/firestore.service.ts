import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  constructor(private firestore: AngularFirestore) {}

  // Ajouter un document
  addDocument(collectionName: string, data: any) {
    return this.firestore.collection(collectionName).add(data);
  }

  // Lire tous les documents d'une collection
  getDocuments(collectionName: string) {
    return this.firestore.collection(collectionName).valueChanges();
  }

  // Mettre à jour un document
  updateDocument(collectionName: string, docId: string, data: any) {
    return this.firestore.collection(collectionName).doc(docId).update(data);
  }

  // Supprimer un document
  deleteDocument(collectionName: string, docId: string) {
    return this.firestore.collection(collectionName).doc(docId).delete();
  }


  /**
   * Create: Creates a new document in Firestore.
   * @param ref - The document reference as a string, e.g., 'events/eventId/...'.
   * @param data - The data to be inserted as a JSON object.
   * @returns Promise<void>
   */
  create(ref: string, data: any): Promise<void> {
    return this.firestore.doc(ref).set(data)
      .then(() => console.log(`Document created at reference: ${ref}`))
      .catch((error) => console.error(`Error creating document at reference ${ref}:`, error));
  }


  /**
   * Read: Reads a document in Firestore.
   * @param ref - The document reference as a string, e.g., 'events/eventId/...'.
   * @returns Observable<any> - An observable with the document data.
   */
  read(ref: string): Observable<any> {
    return this.firestore.doc(ref).valueChanges();
  }
  
  /**
   * ReadField: Reads a specific field in a Firestore document.
   * @param ref - The document reference as a string, e.g., 'events/eventId/...'.
   * @param field - The field to read in the document.
   * @returns Observable<any> - The value of the requested field.
   */
  readField(ref: string, field: string): Observable<any> {
    return this.firestore.doc(ref).valueChanges()
    .pipe(
      map((data: any) => {
        if (data && field in data) {
          return data[field]; // Returns only the requested field's value.
        } else {
            throw new Error(`Field "${field}" does not exist in document "${ref}".`);
          //  console.log(`Field "${field}" does not exist in document "${ref}".`);
        }
      })
    );
  }
  
  /**
   * Adds or updates an object in a map field of a Firestore document.
   * @param ref - The document reference (e.g., 'events/event123').
   * @param mapField - The map field name (e.g., 'participants').
   * @param key - The key for the new object (e.g., 'user3').
   * @param value - The object to add or update (e.g., { name: 'Charlie', status: 'invited' }).
   * @returns Promise<void>
   */
  addObjectToMap(
    ref: string, 
    mapField: string, 
    key: string, 
    value: Record<string, any>
  ): Promise<void> {
    const updatePath = `${mapField}.${key}`; // Use dot notation to target the specific key in the map
    const documentRef = this.firestore.doc(ref);
  
    return documentRef.get().toPromise().then((doc: any) => {
      if (doc.exists) {
        // Document exists, perform an update
        return documentRef.update({
          [updatePath]: value,
        });
      } else {
        // Document does not exist, perform a set
        return documentRef.set({
          [mapField]: {
            [key]: value,
          },
        });
      }
    }).then(() => {
      console.log(`Object added to map field "${mapField}" with key "${key}" in document "${ref}".`);
    }).catch((error) => {
      console.error(`Error adding object to map field "${mapField}" in document "${ref}":`, error);
      throw error;
    });
  }

  /**
   * AddObjectToField: Adds an object to a specific field in a Firestore document.
   * @param ref - The document reference, e.g., 'systemConfig/config'.
   * @param field - The target field, e.g., 'countriesList'.
   * @param newObject - The object to be added to the field.
   * @returns Promise<void>
   */
  
  async addObjectToField(ref: string, field: string, newObject: any): Promise<void> {
    const docRef = this.firestore.doc(ref);

    const docSnapshot = await docRef.get().toPromise();

    if (docSnapshot.exists) {
      const data = docSnapshot.data();

      const existingField = data && data[field] ? data[field] : {};

      const updatedField = {
        ...existingField, // Retain existing objects.
        ...newObject,     // Add the new object.
      };

      return docRef.update({ [field]: updatedField });
    } else {
      return docRef.set({ [field]: newObject }, { merge: true });
    }
  }
}