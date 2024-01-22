using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
    [Table("EDMS_RECEIPT_INPUT_STORE")]
    public class EDMSReceiptInputStore
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(255)]
        public string RcTicketCode { get; set; }

        [StringLength(255)]
        public string BrCode { get; set; }

        [StringLength(255)]
        public string WHS_Code { get; set; }

        [StringLength(255)]
        public string WHS_User { get; set; }

        [StringLength(255)]
        public string NumBox { get; set; }

        [StringLength(255)]
        public string DocType { get; set; }

        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }

        [StringLength(255)]
        public string Note { get; set; }

        [StringLength(255)]
        public string RcSupport { get; set; }

        [StringLength(255)]
        public string RcStatus { get; set; }

        [StringLength(500)]
        public string QR_Code { get; set; }

        [StringLength(50)]
        public string CreatedBy { get; set; }

        public DateTime? CreatedTime { get; set; }
        [StringLength(50)]
        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }
        public int? RqId { get; set; }

        [StringLength(255)]
        public string PersonSender { get; set; }
    }

    public class EDMSReceiptInputStoreModel
    {
        public EDMSReceiptInputStoreModel()
        {
            Box = new EDMSBoxModel();
            ListBox = new List<EDMSBoxModel>();
            ListBoxIDDelete = new List<int>();
            ListFileReceipt = new List<FileUpload>();
            ListFileReceiptRemove = new List<FileUpload>();
        }
        public int Id { get; set; }

        [StringLength(255)]
        public string RcTicketCode { get; set; }

        [StringLength(255)]
        public string BrCode { get; set; }

        [StringLength(255)]
        public string WHS_Code { get; set; }

        [StringLength(255)]
        public string WHS_User { get; set; }

        [StringLength(255)]
        public string NumBox { get; set; }

        [StringLength(255)]
        public string DocType { get; set; }

        public string FromDate { get; set; }
        public string ToDate { get; set; }

        [StringLength(255)]
        public string Note { get; set; }

        [StringLength(255)]
        public string RcSupport { get; set; }

        [StringLength(255)]
        public string RcStatus { get; set; }

        [StringLength(500)]
        public string QR_Code { get; set; }

        [StringLength(50)]
        public string CreatedBy { get; set; }

        public DateTime? CreatedTime { get; set; }
        [StringLength(50)]
        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }
        public int? RqId { get; set; }

        [StringLength(255)]
        public string PersonSender { get; set; }

        public List<EDMSBoxModel> ListBox { get; set; }
        public EDMSBoxModel Box { get; set; }
        public List<int> ListBoxIDDelete { get; set; }
        public List<FileUpload> ListFileReceipt { get; set; }
        public List<FileUpload> ListFileReceiptRemove { get; set; }
    }
}