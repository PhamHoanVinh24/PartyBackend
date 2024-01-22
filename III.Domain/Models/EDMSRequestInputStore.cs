using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
    [Table("EDMS_REQUEST_INPUT_STORE")]
    public class EDMSRequestInputStore
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(255)]
        public string RqTicketCode { get; set; }

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
        public string RqSupport { get; set; }

        [StringLength(255)]
        public string RqStatus { get; set; }

        [StringLength(500)]
        public string QR_Code { get; set; }

        [StringLength(50)]
        public string CreatedBy { get; set; }

        public DateTime? CreatedTime { get; set; }
        [StringLength(50)]
        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }
    }

    public class EDMSRequestInputStoreModel
    {
        public EDMSRequestInputStoreModel()
        {
            Box = new EDMSBoxModel();
            ListBox = new List<EDMSBoxModel>();
            ListBoxIDDelete = new List<int>();
            ListFileRequest = new List<FileUpload>();
            ListFileRequestRemove = new List<FileUpload>();
        }
        public int Id { get; set; }

        [StringLength(255)]
        public string RqTicketCode { get; set; }

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
        public string RqSupport { get; set; }

        [StringLength(255)]
        public string RqStatus { get; set; }

        [StringLength(500)]
        public string QR_Code { get; set; }

        [StringLength(50)]
        public string CreatedBy { get; set; }

        public string CreatedTime { get; set; }
        [StringLength(50)]
        public string UpdatedBy { get; set; }

        public string UpdatedTime { get; set; }
        public List<EDMSBoxModel> ListBox { get; set; }
        public EDMSBoxModel Box { get; set; }
        public List<int> ListBoxIDDelete { get; set; }
        public List<FileUpload> ListFileRequest { get; set; }
        public List<FileUpload> ListFileRequestRemove { get; set; }
    }

    public class FileUpload
    {
        public int? FileId { get; set; }
        public string FileName { get; set; }
        public string FilePath { get; set; }
        public string FileType { get; set; }
        public string ContentType { get; set; }
    }
}