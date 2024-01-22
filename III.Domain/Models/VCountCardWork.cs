using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("GET_COUNT_CARD_WORK")]
    public class VCountCardWork
    {
        [Key]
        public Guid ID { get; set; }
        public int SumCardWork { get; set; }
        public int CardWorkPending { get; set; }
        public int CardWorkSuccess { get; set; }
        public int CardWorkcancel { get; set; }
        public int CardWorkExpires { get; set; }
    }
}
