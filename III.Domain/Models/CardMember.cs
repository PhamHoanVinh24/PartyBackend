using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("CARD_MEMBER")]
    public class CardMember
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(255)]
        public string MemberId { get; set; }

        [StringLength(255)]
        public string CardCode { get; set; }

        [StringLength(255)]
        public string TeamCode { get; set; }

        public DateTime CreatedTime { get; set; }

        public string Responsibility { get; set; }

        public bool Flag { get; set; }
    }
    public class CardMemberCustom
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public string CreatedTime { get; set; }
        public string Responsibility { get; set; }
    }
}
