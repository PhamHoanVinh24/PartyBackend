using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("DISPATCHES_HEADER")]
    public class DispatchesHeader
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(100)]
        public string DispatchCode { get; set; }

        [StringLength(50)]
        public string DocumentCode { get; set; }

        public int DocumentNumber { get; set; }

        [StringLength(255)]
        public string DocumentSymbol { get; set; }

        [StringLength(255)]
        public string Origanization { get; set; }

        public DateTime? FromDate { get; set; }

        public DateTime? PromulgateDate { get; set; }

        [StringLength(1000)]
        public string Epitome { get; set; }

        [StringLength(50)]
        public string DocumentZone { get; set; }

        [StringLength(50)]
        public string DocumentType { get; set; }

        [StringLength(100)]
        public string SignUser { get; set; }

        [StringLength(255)]
        public string Position { get; set; }

        [StringLength(50)]
        public string Confidentiality { get; set; }

        [StringLength(50)]
        public string GetMothod { get; set; }

        public DateTime? CreatedTime { get; set; }

        [StringLength(50)]
        public string CreatedEditor { get; set; }

        [StringLength(255)]
        public string UnitEditor { get; set; }

        public bool? IsReply { get; set; }

        public bool? IsProcess { get; set; }

        public string ReplyStatus { get; set; }

        public DateTime? UpdatedTime { get; set; }

        [StringLength(50)]
        public string UpdatedBy { get; set; }

        public DateTime? DeletedTime { get; set; }

        [StringLength(50)]
        public string DeletedBy { get; set; }

        public bool IsDeleted { get; set; }

        public string Note { get; set; }

        public string Status { get; set; }

        public DateTime? ExperiedReply { get; set; }

        public string ImportantLevel { get; set; }
        public string SecurityLevel { get; set; }
        public bool? IsQppl { get; set; }
        public string Type { get; set; }
        public string DocumentSymbols { get; set; }
        public string UserEditor { get; set; }
        public DateTime? SignDate { get; set; }

        [StringLength(50)]
        public string CreatedUserId { get; set; }
        public int Year { get; set; }
    }
}
