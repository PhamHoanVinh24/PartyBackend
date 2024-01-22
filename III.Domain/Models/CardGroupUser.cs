using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("CARD_GROUP_USER")]
    public class CardGroupUser
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(255)]
        public string MemberId { get; set; }

        [StringLength(255)]
        public string CardCode { get; set; }

        [StringLength(255)]
        public string GroupUserCode { get; set; }

        public DateTime CreatedTime { get; set; }

        public bool Responsibility { get; set; }

        public bool Flag { get; set; }
    }
}
