import { IDocumentBody } from '../../Types/Interfaces/IDocumentData';
import { IDeleteActionData } from '../../Types/Interfaces/IDocActionInterfaces';
import { deleteCustomBlocks, deleteCustomRanges, deleteParagraphs, deleteSectionBreaks, deleteTables, deleteTextRuns } from './Common';
import { DocumentModel } from '../Model/DocumentModel';
import { deleteContent, getDocsUpdateBody } from '../../Shared/Common';

export function DeleteApply(documentModel: DocumentModel, data: IDeleteActionData) {
    const doc = documentModel.getSnapshot();
    // export function DeleteApply(document: DocumentModel, textLength: number, currentIndex: number, segmentId?: string) {
    const { len: textLength, cursor: currentIndex, segmentId } = data;

    const bodyModel = documentModel.getBodyModel(segmentId);

    const body = getDocsUpdateBody(doc, segmentId);

    if (body == null) {
        throw new Error('no body has changed');
    }

    bodyModel.delete(currentIndex, textLength);

    return updateAttributeByDelete(body, textLength, currentIndex);
}

function updateAttributeByDelete(body: IDocumentBody, textLength: number, currentIndex: number): IDocumentBody {
    const { dataStream } = body;

    const startIndex = currentIndex;

    const endIndex = currentIndex + textLength - 1;

    const removeTextRuns = deleteTextRuns(body, textLength, currentIndex);

    const removeParagraphs = deleteParagraphs(body, textLength, currentIndex);

    const removeSectionBreaks = deleteSectionBreaks(body, textLength, currentIndex);

    const removeCustomBlocks = deleteCustomBlocks(body, textLength, currentIndex);

    const removeTables = deleteTables(body, textLength, currentIndex);

    const removeCustomRanges = deleteCustomRanges(body, textLength, currentIndex);

    let removeDataStream = '';
    if (dataStream) {
        body.dataStream = deleteContent(dataStream, startIndex, endIndex);

        removeDataStream = dataStream.slice(startIndex, endIndex);
    }

    return {
        dataStream: removeDataStream,
        textRuns: removeTextRuns,
        paragraphs: removeParagraphs,
        sectionBreaks: removeSectionBreaks,
        customBlocks: removeCustomBlocks,
        tables: removeTables,
        customRanges: removeCustomRanges,
    };
}
