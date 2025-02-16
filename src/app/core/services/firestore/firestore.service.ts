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
  
}