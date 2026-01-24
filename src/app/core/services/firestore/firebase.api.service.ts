import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { deleteField } from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  constructor(private firestore: AngularFirestore) {}

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
        }
      })
    );
  }

  /**
   * Reads a specific sub-field from a Firestore document.
   * 
   * @param ref - Document reference, e.g., 'systemConfig/config'
   * @param fieldPath - Path to the sub-field, e.g., 'countriesList.USA.name'
   * @returns Observable<any> - The value of the specified sub-field.
   */
  readSubField(ref: string, fieldPath: string): Observable<any> {
    return this.firestore.doc(ref).valueChanges().pipe(
      map((doc) => {
        if (!doc) {
          throw new Error(`Document "${ref}" does not exist.`);
        }
        const value = fieldPath.split('.').reduce((acc, key) => acc && acc[key], doc);
        return value;
      })
    );
  }

  /**
   * ReadCollection: Reads a Firestore collection.
   * @param ref - The collection reference.
   * @param condition - Optional conditions for filtering the collection.
   * @returns Observable<any> - An observable with the collection data.
   */
  readCollection(ref: any, condition?: any): Observable<any> {
    return this.firestore.collection(ref, condition).valueChanges({ idField: 'id' });
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
   * ReadSubscribe: Listens to real-time changes to a document in Firestore.
   * @param ref - The document reference as a string, e.g., 'events/eventId/...'.
   * @returns Observable<any> - An observable with real-time data updates.
   */
  readSubscribe(ref: string): Observable<any> {
    return this.firestore.doc(ref).valueChanges({ idField: 'id' });
  }

  /**
   * Update: Updates a Firestore document.
   * @param ref - The document reference as a string, e.g., 'events/eventId/...'.
   * @param data - The new data to update in the document.
   * @returns Promise<void>
   */
  update(ref: string, data: any): Promise<void> {
    return this.firestore.doc(ref).update(data)
      .then(() => console.log(`Document updated at reference: ${ref}`))
      .catch((error) => console.error(`Error updating document at reference ${ref}:`, error));
  }

  /**
   * Updates a specific field in a Firestore document.
   * @param documentPath - The path to the Firestore document (e.g., 'users/user123').
   * @param data - An object containing the field(s) to update (e.g., { age: 31 }).
   * @returns Promise<void>
   */
  updateField(documentPath: string, data: Record<string, any>): Promise<void> {
    return this.firestore.doc(documentPath).update(data)
      .then(() => {
    //    console.log(`Document at "${documentPath}" updated successfully.`);
      })
      .catch((error) => {
        console.error(`Error updating document at "${documentPath}":`, error);
        throw error;
      });
  }

  /**
   * UpdateSubField: Updates a sub-field in a Firestore document.
   * @param ref - The document reference, e.g., 'systemConfig/config'.
   * @param fieldPath - The sub-field path, e.g., 'countriesList.GER.name'.
   * @param value - The new value for the sub-field.
   * @returns Promise<void>
   */
  updateSubField(ref: string, fieldPath: string, value: any): Promise<void> {
    return this.firestore.doc(ref).update({
      [fieldPath]: value,
    }).then(() => {
     console.log(`Sub-field "${fieldPath}" updated successfully in document "${ref}".`);
    }).catch((error) => {
      console.error(`Error updating sub-field "${fieldPath}" in document "${ref}":`, error);
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
  
    return documentRef.get().toPromise().then((doc) => {
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
   * Delete: Deletes a Firestore document.
   * @param ref - The document reference as a string, e.g., 'events/eventId/...'.
   * @returns Promise<void>
   */
  delete(ref: string): Promise<void> {
    return this.firestore.doc(ref).delete()
      .then(() => console.log(`Document deleted at reference: ${ref}`))
      .catch((error) => console.error(`Error deleting document at reference ${ref}:`, error));
  }

  /**
   * DeleteField: Deletes a specific field from a Firestore document.
   * @param ref - The document reference, e.g., 'systemConfig/config'.
   * @param field - The field name, e.g., 'countriesList'.
   * @returns Promise<void>
   */
  deleteField(ref: string, field: string): Promise<void> {
    return this.firestore.doc(ref).update({
      [field]: deleteField(),
    }).then(() => {
  //    console.log(`Field "${field}" deleted from document "${ref}".`);
    }).catch((error) => {
      console.error(`Error deleting field "${field}" from document "${ref}":`, error);
      throw error;
    });
  }

  /**
   * Deletes an object from a map field of a Firestore document.
   * @param ref - The document reference (e.g., 'events/event123').
   * @param mapField - The map field name (e.g., 'participants').
   * @param key - The key of the object to delete (e.g., 'user3').
   * @returns Promise<void>
   */
  deleteObjectFromMap(ref: string, mapField: string, key: string): Promise<void> {
    const updatePath = `${mapField}.${key}`; // Use dot notation to target the specific key in the map
    return this.firestore.doc(ref).update({
      [updatePath]: deleteField(),
    }).then(() => {
  //    console.log(`Object with key "${key}" deleted from map field "${mapField}" in document "${ref}".`);
    }).catch((error) => {
      console.error(`Error deleting object from map field "${mapField}" in document "${ref}":`, error);
      throw error;
    });
  }
  
  /**
   * DeleteSubField: Deletes a sub-field in a Firestore document.
   * @param ref - The document reference, e.g., 'systemConfig/config'.
   * @param fieldPath - The sub-field path, e.g., 'countriesList.GER.name'.
   * @returns Promise<void>
   */
  deleteSubField(ref: string, fieldPath: string): Promise<void> {
    return this.firestore.doc(ref).update({
      [fieldPath]: deleteField(),
    }).then(() => {
  //    console.log(`Sub-field "${fieldPath}" deleted successfully from document "${ref}".`);
    }).catch((error) => {
      console.error(`Error deleting sub-field "${fieldPath}" from document "${ref}":`, error);
      throw error;
    });
  }
}
