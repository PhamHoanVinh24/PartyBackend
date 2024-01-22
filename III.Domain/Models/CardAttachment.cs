using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("CARD_ATTACHMENT")]
    public class CardAttachment
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(255)]
        public string CardCode { get; set; }

        [StringLength(255)]
        public string FileCode { get; set; }

        [StringLength(255)]
        public string MemberId { get; set; }
        
        public DateTime? UpdatedTime { get; set; }

        public DateTime? CreatedTime { get; set; }

        [StringLength(255)]
        public string FileName { get; set; }

        [StringLength(255)]
        public string FileUrl { get; set; }

        public int FileType { get; set; }

        public bool Flag { get; set; }

        public bool IsEdit { get; set; }

        public string ListUserView { get; set; }

        public string ListPermissionViewFile { get; set; }

        public string ChkListCode { get; set; }
        public bool IsEdms { get; set; }
        public int? IdMapping { get; set; }
    }
}
