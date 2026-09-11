import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  Timestamp,
  addDoc
} from 'firebase/firestore';
import { db } from '../../../firebase';
import type { Hino, EscalaSemestralItem } from './types';

const HINOS_COLLECTION = 'hinos';
const ESCALA_COLLECTION = 'escala_semestral';

// ==================== SERVIÇOS DE HINOS ====================

export const listarHinos = async (): Promise<Hino[]> => {
  try {
    const q = query(collection(db, HINOS_COLLECTION), orderBy('numero', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Hino));
  } catch (error) {
    console.error('Erro ao listar hinos:', error);
    throw error;
  }
};

export const cadastrarHino = async (hino: Omit<Hino, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, HINOS_COLLECTION), {
      ...hino,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Erro ao cadastrar hino:', error);
    throw error;
  }
};

export const atualizarHino = async (id: string, dados: Partial<Hino>): Promise<void> => {
  try {
    const hinoRef = doc(db, HINOS_COLLECTION, id);
    await updateDoc(hinoRef, dados);
  } catch (error) {
    console.error('Erro ao atualizar hino:', error);
    throw error;
  }
};

export const excluirHino = async (id: string): Promise<void> => {
  try {
    const hinoRef = doc(db, HINOS_COLLECTION, id);
    await deleteDoc(hinoRef);
  } catch (error) {
    console.error('Erro ao excluir hino:', error);
    throw error;
  }
};

// ==================== SERVIÇOS DE ESCALA SEMESTRAL ====================

export const listarEscalaSemestral = async (): Promise<EscalaSemestralItem[]> => {
  try {
    const q = query(collection(db, ESCALA_COLLECTION), orderBy('dataDomingo', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EscalaSemestralItem));
  } catch (error) {
    console.error('Erro ao listar escala semestral:', error);
    throw error;
  }
};

export const salvarItemEscala = async (item: EscalaSemestralItem): Promise<string> => {
  try {
    if (item.id) {
      const docRef = doc(db, ESCALA_COLLECTION, item.id);
      await updateDoc(docRef, {
        dataDomingo: item.dataDomingo,
        hinoId: item.hinoId,
        updatedAt: Timestamp.now()
      });
      return item.id;
    } else {
      const docRef = await addDoc(collection(db, ESCALA_COLLECTION), {
        dataDomingo: item.dataDomingo,
        hinoId: item.hinoId,
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    }
  } catch (error) {
    console.error('Erro ao salvar item da escala:', error);
    throw error;
  }
};

export const excluirItemEscala = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, ESCALA_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Erro ao excluir item da escala:', error);
    throw error;
  }
};