using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("V_LIST_BOARD")]
    public class VListBoard
    {
        [Key]
        public Guid Id { get; set; }
        public string BoardCode { get; set; }
        public string BoardName { get; set; }
    }
}
