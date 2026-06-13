# Unit 08: DocuSign Signature Flow

## Goal

Send generated contract PDFs to DocuSign for one client signer plus admin countersignature, track envelope state, and archive the final signed PDF.

## Design

DocuSign owns signature routing and signing ceremony. The app owns contract content, contract metadata, relationship/project linkage, and archive state.

## Implementation

### Envelope Creation

- Send generated PDF to DocuSign.
- Designate one client signer.
- Designate admin countersigner.
- Store DocuSign envelope ID and status.

### Status Tracking

- Poll or receive webhook updates according to DocuSign best practice.
- Track sent, viewed, client signed, admin countersigned, completed, declined, voided, expired.
- Verify webhook signatures if webhooks are used.

### Archive

- Retrieve final signed PDF.
- Store signed PDF in private S3.
- Mark contract complete only after client signer and admin countersignature are done.

## Dependencies

- Contract generation and S3 storage.
- DocuSign API credentials.

## Verify When Done

- [ ] Admin can send a generated contract to DocuSign.
- [ ] App stores envelope ID and status.
- [ ] Contract is not complete after client signature alone.
- [ ] Contract completes after admin countersignature.
- [ ] Final signed PDF is archived in private S3.
