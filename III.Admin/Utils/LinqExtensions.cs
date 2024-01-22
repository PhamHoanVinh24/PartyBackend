using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ESEIM.Utils
{
	public static class LinqExtensions
	{
		public static T MinBy<T, TKey>(this IEnumerable<T> source, Func<T, TKey> selector)
		{
			using (var iterator = source.GetEnumerator())
			{
				if (!iterator.MoveNext())
					return default(T);

				var min = iterator.Current;
				var minKey = selector(min);
				IComparer<TKey> comparer = Comparer<TKey>.Default;

				while (iterator.MoveNext())
				{
					var current = iterator.Current;
					var currentKey = selector(current);
					if (comparer.Compare(currentKey, minKey) < 0)
					{
						min = current;
						minKey = currentKey;
					}
				}

				return min;
			}
		}

        public static TSource MaxBy<TSource, TValue>(this IEnumerable<TSource> source, Func<TSource, TValue> selector)
        {
            using (var iter = source.GetEnumerator())
            {
                if (!iter.MoveNext())
                    return default(TSource);
                var max = selector(iter.Current);
                var item = iter.Current;
                var comparer = Comparer<TValue>.Default;
                while (iter.MoveNext())
                {
                    var tmp = selector(iter.Current);
                    if (comparer.Compare(max, tmp) < 0)
                    {
                        item = iter.Current;
                        max = tmp;
                    }
                }
                return item;
            }
        }
        //create branch MinhPhu
        public static IEnumerable<TSource> DistinctBy<TSource, TKey>(this IEnumerable<TSource> source, Func<TSource, TKey> keySelector)
		{
			HashSet<TKey> knownKeys = new HashSet<TKey>();
			foreach (TSource element in source)
			{
				if (knownKeys.Add(keySelector(element)))
				{
					yield return element;
				}
			}
		}

		public static IEnumerable<T> Traverse<T>(this IEnumerable<T> source,
													Func<T, IEnumerable<T>> selector)
		{
			foreach (T item in source)
			{
				yield return item;
				IEnumerable<T> children = selector(item);
				foreach (T child in children.Traverse(selector))
				{
					yield return child;
				}
			}
		}
        public static IEnumerable<T> Flatten<T>(this IEnumerable<T> e, Func<T, IEnumerable<T>> f)
        {
            return e.SelectMany(c => f(c).Flatten(f)).Concat(e);
        }
        public static IEnumerable<T> Expand<T>(
        this IEnumerable<T> source, Func<T, IEnumerable<T>> elementSelector)
        {
            var stack = new Stack<IEnumerator<T>>();
            var e = source.GetEnumerator();
            try
            {
                while (true)
                {
                    while (e.MoveNext())
                    {
                        var item = e.Current;
                        yield return item;
                        var elements = elementSelector(item);
                        if (elements == null) continue;
                        stack.Push(e);
                        e = elements.GetEnumerator();
                    }
                    if (stack.Count == 0) break;
                    e.Dispose();
                    e = stack.Pop();
                }
            }
            finally
            {
                e.Dispose();
                while (stack.Count != 0) stack.Pop().Dispose();
            }
        }
       
        public static IOrderedEnumerable<T> NullableOrderBy<T>(this IEnumerable<T> list, Func<T, string> keySelector)
        {
            return list.OrderBy(v => keySelector(v) != null ? 1 : 0).ThenBy(keySelector);
        }
    }
}
