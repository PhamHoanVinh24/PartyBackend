using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("VIBAppFunction")]
    public class VIBAppFunction
    {
        public int ApplicationId { get; set; }
        public virtual VIBApplication Application { get; set; }

        public int FunctionId { get; set; }
        public virtual VIBFunction Function { get; set; }
    }
}