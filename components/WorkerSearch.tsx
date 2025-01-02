import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Worker = {
  id: number;
  name: string;
};

type WorkerSearchProps = {
  onSelect: (worker: Worker | null) => void;
  token: string;
};

export function WorkerSearch({ onSelect, token }: WorkerSearchProps) {
  const [query, setQuery] = useState('');
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkers = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/workers`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (data.success) {
          setWorkers(data.data);
        } else {
          throw new Error(data.message);
        }
      } catch (error) {
        setError("Failed to fetch workers. Please try again.");
        console.error("Error fetching workers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkers();
  }, [token]);

  const filteredWorkers = workers.filter(worker =>
    worker.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <Input
        type="text"
        placeholder="Search workers..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {loading && <div>Loading workers...</div>}
      {error && <div className="text-red-500">{error}</div>}
      <div className="max-h-40 overflow-y-auto">
        {filteredWorkers.map(worker => (
          <Button
            key={worker.id}
            variant="ghost"
            className="w-full justify-start"
            onClick={() => onSelect(worker)}
          >
            {worker.name}
          </Button>
        ))}
      </div>
      <Button variant="outline" onClick={() => onSelect(null)}>Clear Selection</Button>
    </div>
  );
}

